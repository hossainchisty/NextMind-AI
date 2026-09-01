from abc import ABC, abstractmethod
from typing import List, Dict


class BaseDocumentParser(ABC):
    @abstractmethod
    def parse(self, file_path: str) -> List[Dict]:
        raise NotImplementedError
