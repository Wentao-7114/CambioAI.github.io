import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import UploadInterface from './components/UploadInterface';
import NoticeContainer from './components/NoticeContainer';
import './DocumentParsing.css';
import ExtractFullContent from './components/ExtractFullContent/ExtractFullContent';
import ExtractKeyValue from './components/ExtractKeyValue/ExtractKeyValue';
import ExtractTables from './components/ExtractTables/ExtractTables';
import { FileProvider, LoadingProvider } from './components/FileContext';
import TourComponent from './components/TourComponent';
import axios from 'axios';

const ALLOWED_FILE_TYPES = ["pdf", "docx", "doc", "png", "jpg", "jpeg", "ppt", "pptx"];


const DocumentParsing: React.FC = () => {
  // Assuming the URL of your default PDF
  const defaultPdfUrl = "/sampleFiles/samplePDF.pdf";

  const [file, setFile] = useState<File | null>(null);
  const [FullContent_apiResponse, setFullContent_apiResponse] = useState<string | null>(null);
  const [KeyValue_apiResponse, setKeyValue_apiResponse] = useState(null);
  const [Tables_apiResponse, setTables_apiResponse] = useState<string[] | null>(null);
  const [isTourStarted, setIsTourStarted] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const location = useLocation();

  const steps = [
    { position: { top: '50vh', left: '68vw' },
   content: 'Decide what to leave out',
    buttonText: "Got it!",
    arrowPosition :{'--top':'none', '--bottom':'none', '--left':'100% ', '--right':'none' },
    shape: {'--clip-path': ' polygon(0% 0, 0% 100%,100% 50%)'}  ,
    },




    { position: { top: '370px', left: '980px' },
   content: 'View parsed content below',
    buttonText: "Got it!",
    arrowPosition :{'--bottom':'none', '--top':'100%', '--left':'10%  ', '--right':'none' },
    shape: {'--clip-path': 'polygon(0 0, 100% 0, 50% 100%)'}  ,
    },

    { position: { top: '570px', left: '83vw' },
   content: 'You can download/copy parsed content or redo the task',
    buttonText: "Got it!",
    arrowPosition :{'--bottom':'100%', '--top':'none', '--left':'none  ', '--right':'none' },
    shape: {'--clip-path': 'polygon(0 100%, 100% 100%, 50% 0)'}  ,
    },
    { position: { top: '100vh', left: '83vw' },
   content: 'Great job! Now you can upload your doc to start parsing',
    buttonText: "Finish",
    arrowPosition :{'--bottom':'none', '--top':'100%', '--left':'none  ', '--right':'none' },
    shape: {'--clip-path': 'polygon(0 0, 100% 0, 50% 100%)'}  ,
    },



  ];

  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.file) setFile(state.file);

    }
    if (location.state && (location.state as any).isTourStarted) {
      setIsTourStarted((location.state as any).isTourStarted);
      setIsTourOpen((location.state as any).isTourStarted);
    }
  }, [location]);
  const handleFileChange = (file: File) => {
      setFile(file);
  };

  const base_url = process.env.REACT_APP_DEPLOYED_STATE === "LOCAL" ? process.env.REACT_APP_LOCAL_SERVER_URL : process.env.REACT_APP_DEPLOYED_SERVER_URL;
  const server_url_keyValues = process.env.REACT_APP_DEPLOYED_STATE === "LOCAL" ? `${base_url}/extract_key_value` : `${base_url}/json/extract`;
  const server_url_full = process.env.REACT_APP_DEPLOYED_STATE === "LOCAL" ? `${base_url}/parse` : `${base_url}/extract`;
  const server_url_tables = process.env.REACT_APP_DEPLOYED_STATE === "LOCAL" ? `${base_url}/parse` : `${base_url}/table/extract`;
  const server_url_qa = `${process.env.REACT_APP_LOCAL_SERVER_URL}/extract_question_answer`
  const api_key = process.env.REACT_APP_DEPLOYED_STATE === "LOCAL" ? process.env.REACT_APP_LOCAL_SERVER_API_KEY : process.env.REACT_APP_DEPLOYED_SERVER_API_KEY;

  const ExtractKeyValuePostServer = async (input_keys: string[], input_descriptions: string[]) => {
    if (input_keys.length === 0) {
      alert("You need to have at least one key");
      return;
    }
    if (input_keys[0] === "") {
      alert("You need to have at least one key");
      return;
    }

    if (input_keys.length !== input_descriptions.length) {
      alert("You need to have the same number of keys and descriptions");
      return;
    }

    const fileCheck = await checkFileAndFileType();
    if (!fileCheck) {
      alert("Invalid file. Please check your file and try again.");
      return;
    }
    const {fileToUse, file_type} = fileCheck;

    if (process.env.REACT_APP_DEPLOYED_STATE === "LOCAL") {
      return ExtractKeyValuePostServerLocal(input_keys, input_descriptions, fileToUse, file_type);
    } else {
      return ExtractKeyValuePostServerRemote(input_keys, input_descriptions, fileToUse, file_type);
    }
  }

  const ExtractKeyValuePostServerLocal = async (input_keys: string[], input_descriptions: string[], fileToUse: File, file_type: string) => {
    const input_key_description_pairs = input_keys.map((key, index) => ({
      key: key,
      description: input_descriptions[index]
    }));
    try {
      // Read and encode the file
      const fileContent = await readFileAsBase64(fileToUse);

      const payload = {
        extract_input_key_description_pairs: input_key_description_pairs,
        file_content: fileContent,
        file_type: file_type,
      };

      const headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
      };
      console.log("started");
      console.log(input_key_description_pairs);
      const response = await axios.post(server_url_keyValues, payload, { headers });
      console.log(JSON.stringify(response.data, null, 2));
      setKeyValue_apiResponse(response.data.output_dict[0]);
      // Handle successful response (e.g., update state, show success message)
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('An error occurred while uploading the file. Please try again.');
      }
    }
  };

  const ExtractKeyValuePostServerRemote = async (input_keys: string[], input_descriptions: string[], fileToUse: File, file_type: string) => {
    console.log("EXTRACT KEY VALUE POST SERVER REMOTE");
    const fileContent = await readFileAsBase64(fileToUse);

    const extract_instruction: {[key: string]: string} = {};
    for (let i = 0; i < input_keys.length; i++) {
      extract_instruction[input_keys[i]] = input_descriptions[i];
    }

    const params = {
      file_content: fileContent,
      file_type: file_type,
      instruction_args: {
        extract_instruction: extract_instruction,
      }
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": api_key || '',
      },
    };

    const keyValueResponse = await axios.post(server_url_keyValues, params, config);

    if (keyValueResponse.status !== 200) {
      throw new Error('Failed to extract data');
    }
    const keyValue = keyValueResponse.data.json[0][0];
    console.log('Got key value', keyValue)

    for (const [key, value] of Object.entries(keyValue)) {
      keyValue[key] = [value];
    }

    setKeyValue_apiResponse(keyValue);
  }

  const ExtractTablesPostServer = async () => {
    const fileCheck = await checkFileAndFileType();
    if (!fileCheck) {
      alert("Invalid file. Please check your file and try again.");
      return;
    }
    const {fileToUse, file_type} = fileCheck;
    if (process.env.REACT_APP_DEPLOYED_STATE === "LOCAL") {
      return ExtractTablesPostServerLocal(fileToUse, file_type);
    } else {
      return ExtractTablesPostServerRemote(fileToUse, file_type);
    }
  }

  const ExtractTablesPostServerLocal = async (fileToUse: File, file_type: string) => {
    console.log("EXTRACT TABLES POST SERVER LOCAL");
    try {
      // Read and encode the file
      const fileContent = await readFileAsBase64(fileToUse);

      const extract_args = {
        vqa_figures_flag: false,
        vqa_charts_flag: false,
        vqa_tables_flag: true,
        vqa_footnotes_flag: false,
        vqa_headers_flag: false,
        vqa_footers_flag: false,
        vqa_page_nums_flag: false,
        vqa_table_only_flag: true,
        vqa_table_only_caption_flag: false
      };

      const payload = {
        extract_args: extract_args,
        file_content: fileContent,
        file_type: file_type,
      };

      const headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
      };
      console.log("started");
      const response = await axios.post(server_url_tables, payload, { headers });
      console.log(JSON.stringify(response.data, null, 2));
      setTables_apiResponse(response.data.output_dict["markdown"]);
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('An error occurred while uploading the file. Please try again.');
      }
    }
  }

  const ExtractTablesPostServerRemote = async (fileToUse: File, file_type: string) => {
    console.log("EXTRACT TABLES POST SERVER REMOTE");
    const fileContent = await readFileAsBase64(fileToUse);

    const params = {
      file_content: fileContent,
      file_type: file_type,
    }

    const config = {
      headers: {
        'x-api-key': api_key || '',
      },
    };

    const tableResponse = await axios.post(server_url_tables, params, config);

    if (tableResponse.status !== 200) {
      throw new Error('Failed to extract data');
    }
    const tableData = tableResponse.data;
    if (!tableData) {
      alert("No tables found in the document");
      return;
    }
    //check if tableData has markdown
    if (tableData.markdown) {
      setTables_apiResponse(tableData.markdown);
    } else {
      setTables_apiResponse(["<p>No tables found in the document</p>"]);
    }
  }

  const ParsePostServer = async () => {
    const fileCheck = await checkFileAndFileType();
    if (!fileCheck) {
      alert("Invalid file. Please check your file and try again.");
      return;
    }
    const {fileToUse, file_type} = fileCheck;

    const extract_args = {
      vqa_figures_flag: true,
      vqa_charts_flag: true,
      vqa_tables_flag: true,
      vqa_footnotes_flag: false,
      vqa_headers_flag: true,
      vqa_footers_flag: true,
      vqa_page_nums_flag: true,
      vqa_table_only_flag: false,
      vqa_table_only_caption_flag: true
    };

    if (process.env.REACT_APP_DEPLOYED_STATE === "LOCAL") {
      return ParsePostServerLocal(fileToUse, file_type, extract_args);
    } else {
      return ParsePostServerRemote(fileToUse, file_type, extract_args);
    }
  }

  const ParsePostServerLocal = async (fileToUse: File, file_type: string, extract_args: any) => {
    try {
      // Read and encode the file
      const fileContent = await readFileAsBase64(fileToUse);

      const payload = {
        extract_args: extract_args,
        file_content: fileContent,
        file_type: file_type,
      };

      const headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
      };
      console.log("started");
      const response = await axios.post(server_url_full, payload, { headers });
      console.log(JSON.stringify(response.data, null, 2));
      setFullContent_apiResponse(response.data.output_dict["markdown"][0]);
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert('An error occurred while uploading the file. Please try again.');
      }
    }
  };


  const ParsePostServerRemote = async (fileToUse: File, file_type: string, extract_args: any) => {
    console.log("EXTRACT FULL CONTENT POST SERVER REMOTE", fileToUse);

    const fileContent = await readFileAsBase64(fileToUse);

    const params = {
      file_content: fileContent,
      file_type: file_type,
      mask_pii: false,
      //TODO: add extract_args
    }

    const config = {
      headers: {
        'x-api-key': api_key || '',
      },
    };

    const extractStatusResponse = await axios.post(server_url_full, params, config);

    if (extractStatusResponse.status !== 200) {
      throw new Error('Failed to extract data');
    }
    const markdown = extractStatusResponse.data.markdown[0];

    setFullContent_apiResponse(markdown);
  }

  const ExtractQAPostServer = async (userMessage: string): Promise<string> => {
    const error_message = "I'm sorry, I ran into an error. Please try again.";
    const fileCheck = await checkFileAndFileType();
    if (!fileCheck) {
      alert("Invalid file. Please check your file and try again.");
      return "I'm sorry, you're using an invalid file type";
    }
    const { fileToUse } = fileCheck;

    try {
      // Read and encode the file
      const fileContent = await readFileAsBase64(fileToUse);

      const file_type = fileToUse.name.split('.').pop();

      const payload = {
        input_questions_list: [userMessage],
        file_content: fileContent,
        file_type: file_type,
      };

      const headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
      };
      console.log("started");
      const response = await axios.post(server_url_qa, payload, { headers });
      console.log(JSON.stringify(response.data, null, 2));
      const answer = response.data["output_dict"][0]["answer"];
      if (answer === "") return "I'm sorry, I don't know the answer to that question. Please try again.";
      return answer;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        return error_message;
      } else {
        return error_message;

      }
    }
  };

  const checkFileAndFileType = async () => {
    let fileToUse = file;
    if (! fileToUse) {
      try {
          const response = await fetch(defaultPdfUrl);
          const blob = await response.blob();
          fileToUse = new File([blob], 'defaultfile.pdf', { type: blob.type });
      } catch (error) {
          alert('Error fetching the default file. Please try again.');
          return;
      }
    }

    // Check file size (e.g., limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (fileToUse.size > MAX_FILE_SIZE) {
      alert(`File size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }
    const file_type = fileToUse.name.split('.').pop();

    if (!file_type) {
      alert("File type not supported");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file_type)) {
      alert("File type not supported");
      return;
    }
    return {fileToUse, file_type};
  }

  // Helper function to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 string (remove the data URL prefix)
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };


  const renderPreview = () => {

      if (file) {
            const fileUrl = URL.createObjectURL(file);
            if (file.type.startsWith('application/pdf')) {
            return <iframe src={fileUrl} style={{ width: '100%', height: '85vh' }} frameBorder="0"></iframe>;
            } else if (file.type.startsWith('image')) {
            return <img src={fileUrl} alt="Preview" style={{ width: '100%', height: 'auto' }} />;
            }
      }
      if (!file && defaultPdfUrl  ) {
            return <iframe src={defaultPdfUrl} style={{ width: '100%', height: '100vh' }} frameBorder="0"></iframe>;}

      if (!file && !defaultPdfUrl) return <p className="no-file-selected">Your uploaded file will be shown here :)</p>;


    };




    const initialCategory = location.state?.category || 'full';


    const [activeCategory, setActiveCategory] = useState<'full' | 'tables' | 'keyValue'>(initialCategory);
    // const renderCategoryContent = () => {
    //   switch (activeCategory) {
    //     // case 'full':
    //     //   return <p>Full content parsing options and details will go here.</p>;
    //     case 'tables':
    //       return <p>Table extraction options and details will go here.</p>;
    //       // case 'keyValue':
    //       //   return <ExtractKeyValue />;
    //     default:
    //       return null;
    //   }
    // };








  return (

    <div className="DocumentParsing">
      <Header   />
      <SubHeader   />
      <LoadingProvider>
          <div className="DocumentParsing_container">
            <div className="DocumentParsing_left_panel">
              <div >
                <h2 className="DocumentParsing_left-header">File Outlook</h2>
              </div>

              {renderPreview()}
            </div>
            <div className="DocumentParsing_right_panel">
              <div className="DocumentParsing_FULL">
                <NoticeContainer />
              </div>








          <div >
            <h2 className="DocumentParsing_category_header">Parse Documents</h2>
          </div>
          <div className="DocumentParsing_category-buttons">
            <button onClick={() => setActiveCategory('full')} className={activeCategory === 'full' ? 'active' : ''}>
              Extract Full Content
            </button>
            <button onClick={() => setActiveCategory('tables')} className={activeCategory === 'tables' ? 'active' : ''}>
              Extract Tables Only
            </button>
            <button onClick={() => setActiveCategory('keyValue')} className={activeCategory === 'keyValue' ? 'active' : ''} >
              Extract Key-Value Pairs Beta
            </button>
          </div>
          <div className="DocumentParsing_category-content">
          <FileProvider ExtractKeyValuePostServer={ExtractKeyValuePostServer} ParsePostServer={ParsePostServer} ExtractQAPostServer={ExtractQAPostServer} ExtractTablesPostServer={ExtractTablesPostServer}>

          <ExtractFullContent isActive={activeCategory === 'full'} onFileChange={handleFileChange} FullContent_apiResponse={FullContent_apiResponse} />
          <ExtractTables isActive={activeCategory === 'tables'} onFileChange={handleFileChange} Tables_apiResponse={Tables_apiResponse} />
          <ExtractKeyValue isActive={activeCategory === 'keyValue'} onFileChange={handleFileChange} KeyValue_apiResponse={KeyValue_apiResponse} />
            {/* {renderCategoryContent()} */}


          </FileProvider>
              </div>









        </div>
      </div>
      {isTourOpen && (
            <TourComponent steps={steps} onClose={() => setIsTourOpen(false)} />
           )}
    </LoadingProvider>
    </div >

  );
};

export default DocumentParsing;









