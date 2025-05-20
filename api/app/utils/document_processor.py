import os
import tempfile
import subprocess
import json
from typing import Optional, Dict, Any
import logging

# Import these libraries only if available
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text content as a string
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    extracted_text = ""
    
    # Try using PyMuPDF if available
    if PYMUPDF_AVAILABLE:
        try:
            doc = fitz.open(pdf_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                extracted_text += page.get_text()
            logger.info(f"Successfully extracted text from {pdf_path} using PyMuPDF")
            return extracted_text
        except Exception as e:
            logger.error(f"Error extracting text with PyMuPDF: {str(e)}")
    
    # Fallback to pdftotext command line tool
    try:
        # Check if pdftotext is available
        subprocess.run(["pdftotext", "-v"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        
        # Create a temporary file for the text output
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp_file:
            temp_text_path = temp_file.name
        
        # Run pdftotext
        subprocess.run(["pdftotext", pdf_path, temp_text_path], check=True)
        
        # Read the extracted text
        with open(temp_text_path, 'r', encoding='utf-8') as f:
            extracted_text = f.read()
        
        # Clean up the temp file
        os.unlink(temp_text_path)
        
        logger.info(f"Successfully extracted text from {pdf_path} using pdftotext")
        return extracted_text
    except (subprocess.SubprocessError, FileNotFoundError) as e:
        logger.error(f"Error extracting text with pdftotext: {str(e)}")
    
    # If we reach here, both methods failed
    if not extracted_text:
        logger.warning(f"Failed to extract text from PDF {pdf_path} with all available methods")
        return "Failed to extract text from PDF. Please install PyMuPDF or pdftotext."
    
    return extracted_text

def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text content as a string
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    if not TESSERACT_AVAILABLE:
        logger.warning("Tesseract OCR is not available. Please install pytesseract and Pillow.")
        return "OCR text extraction requires pytesseract and Pillow libraries."
    
    try:
        # Open the image
        image = Image.open(image_path)
        
        # Perform OCR
        extracted_text = pytesseract.image_to_string(image)
        
        logger.info(f"Successfully extracted text from image {image_path}")
        return extracted_text
    except Exception as e:
        logger.error(f"Error performing OCR on image: {str(e)}")
        return f"Failed to extract text from image: {str(e)}"

def parse_chat_log(chat_log_path: str) -> list:
    """
    Parse a chat log file into a structured format.
    
    Args:
        chat_log_path: Path to the chat log file
        
    Returns:
        List of chat messages
    """
    if not os.path.exists(chat_log_path):
        raise FileNotFoundError(f"Chat log file not found: {chat_log_path}")
    
    try:
        # Try to parse as JSON first
        with open(chat_log_path, 'r', encoding='utf-8') as f:
            content = f.read()
            try:
                # Check if this is a JSON array of messages
                messages = json.loads(content)
                if isinstance(messages, list):
                    return messages
            except json.JSONDecodeError:
                # Not JSON, continue to text parsing
                pass
        
        # Parse as plain text with simple format detection
        messages = []
        current_role = None
        current_content = []
        
        with open(chat_log_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
            for line in lines:
                line = line.strip()
                
                # Skip empty lines
                if not line:
                    continue
                
                # Check for user/assistant markers
                if line.startswith("User:") or line.startswith("You:"):
                    # Save previous message if it exists
                    if current_role and current_content:
                        messages.append({
                            "role": current_role,
                            "content": "\n".join(current_content)
                        })
                    
                    # Start new user message
                    current_role = "user"
                    current_content = [line[line.index(":")+1:].strip()]
                
                elif line.startswith("Assistant:") or line.startswith("AI:"):
                    # Save previous message if it exists
                    if current_role and current_content:
                        messages.append({
                            "role": current_role,
                            "content": "\n".join(current_content)
                        })
                    
                    # Start new assistant message
                    current_role = "assistant"
                    current_content = [line[line.index(":")+1:].strip()]
                
                else:
                    # Continue current message
                    if current_role:
                        current_content.append(line)
            
            # Add the last message
            if current_role and current_content:
                messages.append({
                    "role": current_role,
                    "content": "\n".join(current_content)
                })
        
        return messages
    
    except Exception as e:
        logger.error(f"Error parsing chat log: {str(e)}")
        return []
