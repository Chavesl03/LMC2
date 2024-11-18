// Since we're not using PDF functionality anymore, we'll create a simpler version
// that just extracts text from uploaded files
export async function analyzePDF(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      throw new Error('No text content found in the file. Please ensure the file contains searchable text.');
    }

    return text;
  } catch (error) {
    console.error('File analysis error:', error);
    if (error instanceof Error) {
      throw new Error(`File analysis failed: ${error.message}`);
    }
    throw new Error('Failed to analyze file. Please make sure it contains valid text content.');
  }
}