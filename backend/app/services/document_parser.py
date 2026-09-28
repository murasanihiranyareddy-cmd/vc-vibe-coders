import io
import os
import logging
from typing import List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("vc.doc_parser")

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt", ".md"}

class DocumentParserService:
    """
    Server-side document parser supporting PDF, DOCX, PPTX, TXT, and Markdown files.
    Performs security validation, file type checks, text extraction, and chunking.
    """

    @staticmethod
    def validate_file(filename: str, file_size: int) -> str:
        ext = os.path.splitext(filename.lower())[1]
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Allowed formats: PDF, DOCX, PPTX, TXT, MD."
            )
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of 15MB (got {file_size / (1024 * 1024):.1f}MB)."
            )
        return ext

    @classmethod
    def extract_text(cls, content_bytes: bytes, filename: str) -> Tuple[str, List[str]]:
        ext = os.path.splitext(filename.lower())[1]
        full_text = ""

        try:
            if ext == ".pdf":
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(content_bytes))
                pages_text = []
                for idx, page in enumerate(reader.pages):
                    t = page.extract_text() or ""
                    if t.strip():
                        pages_text.append(f"[Page {idx + 1}]\n{t.strip()}")
                full_text = "\n\n".join(pages_text)

            elif ext == ".docx":
                import docx
                doc = docx.Document(io.BytesIO(content_bytes))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                full_text = "\n\n".join(paragraphs)

            elif ext == ".pptx":
                from pptx import Presentation
                prs = Presentation(io.BytesIO(content_bytes))
                slide_texts = []
                for idx, slide in enumerate(prs.slides):
                    shapes_text = []
                    for shape in slide.shapes:
                        if hasattr(shape, "text") and shape.text.strip():
                            shapes_text.append(shape.text.strip())
                    if shapes_text:
                        slide_texts.append(f"[Slide {idx + 1}]\n" + "\n".join(shapes_text))
                full_text = "\n\n".join(slide_texts)

            elif ext in (".txt", ".md"):
                full_text = content_bytes.decode("utf-8", errors="replace")

            if not full_text.strip():
                full_text = f"Document '{filename}' was uploaded but contains no extractable text."

            chunks = cls.chunk_text(full_text, chunk_size=1000, overlap=100)
            return full_text, chunks

        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {str(e)}")
            raise HTTPException(
                status_code=422,
                detail=f"Failed to parse document content: {str(e)}"
            )

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """Splits long text into manageable overlapping semantic chunks for memory retention."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for p in paragraphs:
            p_clean = p.strip()
            if not p_clean:
                continue

            if len(current_chunk) + len(p_clean) <= chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + p_clean
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                # If paragraph itself is longer than chunk_size, split by words
                if len(p_clean) > chunk_size:
                    words = p_clean.split()
                    temp = ""
                    for w in words:
                        if len(temp) + len(w) + 1 <= chunk_size:
                            temp += (" " if temp else "") + w
                        else:
                            chunks.append(temp)
                            temp = w
                    current_chunk = temp
                else:
                    current_chunk = p_clean

        if current_chunk:
            chunks.append(current_chunk)

        return chunks if chunks else [text]

doc_parser = DocumentParserService()
