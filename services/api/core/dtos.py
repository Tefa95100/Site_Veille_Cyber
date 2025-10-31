from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class ArticleCreateDTO:
    title: str
    url: str
    theme: Optional[str] = None


@dataclass(frozen=True)
class ArticleUpdateDTO:
    title: Optional[str] = None
    url: Optional[str] = None
    theme: Optional[str] = None


@dataclass(frozen=True)
class ArticleDTO:
    id: int
    title: str
    url: str
    theme: Optional[str] = None
