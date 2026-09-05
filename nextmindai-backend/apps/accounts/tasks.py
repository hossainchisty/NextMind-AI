import logging

from celery import shared_task

logger = logging.getLogger("apps")


@shared_task
def delete_account_task(user_id: str):
    """Purge a user's R2 files, then delete the user (cascades all rows)."""
    from django.contrib.auth import get_user_model

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error("Account not found for deletion: %s", user_id)
        return

    from apps.documents.models import Document

    keys = set(
        Document.objects.filter(user=user)
        .exclude(file_key="")
        .values_list("file_key", flat=True)
    )
    if user.avatar:
        keys.add(user.avatar)

    if keys:
        try:
            from apps.documents.services.storage import delete_from_r2
            for key in keys:
                try:
                    delete_from_r2(key)
                except Exception as e:
                    logger.error("Failed to delete R2 file %s: %s", key, e)
        except Exception as e:
            logger.error("R2 purge failed for account %s: %s", user_id, e)

    email = user.email
    user.delete()
    logger.info("Deleted account %s (%s)", user_id, email)
