// File processing utilities for Dental AI Interface

class FileProcessor {
  constructor() {
    this.files = [];
    this.processedFiles = [];
    this.zipContents = [];
  }

  // Initialize the file processor
  async initialize() {
    console.log("File processor initialized");
    return true;
  }

  // Add a file to be processed
  addFile(file) {
    this.files.push({
      file: file,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    console.log(`Added file to processor: ${file.name}`);
    return true;
  }

  // Process all files
  async processFiles() {
    if (this.files.length === 0) {
      console.log("No files to process");
      return false;
    }

    try {
      for (const fileObj of this.files) {
        fileObj.status = 'processing';
        await this.processFile(fileObj);
        fileObj.status = 'completed';
      }

      console.log("All files processed successfully");
      return true;
    } catch (error) {
      console.error("Error processing files:", error);
      return false;
    }
  }

  // Process a single file
  async processFile(fileObj) {
    try {
      const { file } = fileObj;
      console.log(`Processing file: ${file.name}`);

      // Check if it's a zip file
      if (file.name.toLowerCase().endsWith('.zip')) {
        await this.unzipFile(file);
      } else {
        // Process as a regular file
        await this.processRegularFile(file);
      }

      this.processedFiles.push({
        originalFile: file.name,
        processedAt: new Date().toISOString(),
        success: true
      });

      return true;
    } catch (error) {
      console.error(`Error processing file ${fileObj.file.name}:`, error);
      fileObj.status = 'error';
      return false;
    }
  }

  // Unzip a file and process its contents
  async unzipFile(file) {
    try {
      console.log(`Unzipping file: ${file.name}`);
      
      // Load JSZip library dynamically if not already loaded
      if (typeof JSZip === 'undefined') {
        await this.loadJSZip();
      }
      
      // Read the zip file
      const zipData = await this.readFileAsArrayBuffer(file);
      const zip = await JSZip.loadAsync(zipData);
      
      // Process each file in the zip
      const zipFiles = [];
      
      zip.forEach(async (relativePath, zipEntry) => {
        // Skip directories
        if (zipEntry.dir) return;
        
        console.log(`Found file in zip: ${relativePath}`);
        
        // Get the file data
        const content = await zipEntry.async('blob');
        const extractedFile = new File([content], relativePath, { type: this.getFileType(relativePath) });
        
        zipFiles.push({
          name: relativePath,
          file: extractedFile,
          size: content.size,
          type: this.getFileType(relativePath)
        });
        
        // Process the extracted file
        await this.processRegularFile(extractedFile);
      });
      
      this.zipContents = zipFiles;
      console.log(`Unzipped ${zipFiles.length} files from ${file.name}`);
      
      return true;
    } catch (error) {
      console.error(`Error unzipping file ${file.name}:`, error);
      throw error;
    }
  }

  // Process a regular (non-zip) file
  async processRegularFile(file) {
    try {
      console.log(`Processing regular file: ${file.name}`);
      
      // Determine file type and process accordingly
      const fileType = this.getFileType(file.name);
      
      if (fileType === 'application/json') {
        // Process JSON file
        const content = await this.readFileAsText(file);
        const jsonData = JSON.parse(content);
        console.log(`Processed JSON file: ${file.name}`, jsonData);
        
        // Add to processed files
        this.processedFiles.push({
          name: file.name,
          type: 'json',
          data: jsonData,
          size: file.size,
          processedAt: new Date().toISOString()
        });
      } else if (fileType === 'text/csv') {
        // Process CSV file
        const content = await this.readFileAsText(file);
        const csvData = this.parseCSV(content);
        console.log(`Processed CSV file: ${file.name}`, csvData);
        
        // Add to processed files
        this.processedFiles.push({
          name: file.name,
          type: 'csv',
          data: csvData,
          size: file.size,
          processedAt: new Date().toISOString()
        });
      } else if (fileType.startsWith('image/')) {
        // Process image file
        const imageUrl = URL.createObjectURL(file);
        console.log(`Processed image file: ${file.name}`, imageUrl);
        
        // Add to processed files
        this.processedFiles.push({
          name: file.name,
          type: 'image',
          url: imageUrl,
          size: file.size,
          processedAt: new Date().toISOString()
        });
      } else {
        // Process other file types as text
        const content = await this.readFileAsText(file);
        console.log(`Processed text file: ${file.name}`);
        
        // Add to processed files
        this.processedFiles.push({
          name: file.name,
          type: 'text',
          data: content,
          size: file.size,
          processedAt: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error processing regular file ${file.name}:`, error);
      throw error;
    }
  }

  // Get file type based on extension
  getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      'json': 'application/json',
      'csv': 'text/csv',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // Parse CSV data
  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(value => value.trim());
      const row = {};
      
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j];
      }
      
      data.push(row);
    }
    
    return {
      headers,
      data
    };
  }

  // Read file as text
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }

  // Read file as array buffer (for zip files)
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = event => {
        resolve(event.target.result);
      };
      
      reader.onerror = error => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // Load JSZip library dynamically
  loadJSZip() {
    return new Promise((resolve, reject) => {
      if (typeof JSZip !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      
      script.onload = () => {
        console.log('JSZip library loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load JSZip library');
        reject(new Error('Failed to load JSZip library'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Get all processed files
  getProcessedFiles() {
    return this.processedFiles;
  }

  // Get zip contents
  getZipContents() {
    return this.zipContents;
  }

  // Format processed files for Gemini LLM
  formatFilesForLLM() {
    const formattedData = {
      files: this.processedFiles.map(file => {
        // Create a simplified version of the file data for the LLM
        const fileData = {
          name: file.name || file.originalFile,
          type: file.type,
          processedAt: file.processedAt,
          size: file.size
        };
        
        // Include actual data based on file type
        if (file.type === 'json' || file.type === 'csv') {
          fileData.data = file.data;
        } else if (file.type === 'text') {
          fileData.content = file.data;
        } else if (file.type === 'image') {
          fileData.description = `[Image file: ${file.name}]`;
        }
        
        return fileData;
      }),
      metadata: {
        totalFiles: this.processedFiles.length,
        zipFiles: this.zipContents.length,
        processedAt: new Date().toISOString()
      }
    };
    
    return formattedData;
  }

  // Clear all files
  clearFiles() {
    this.files = [];
    this.processedFiles = [];
    this.zipContents = [];
    console.log("All files cleared from processor");
    return true;
  }
}

// Export the class for use in the main application
export default FileProcessor;
