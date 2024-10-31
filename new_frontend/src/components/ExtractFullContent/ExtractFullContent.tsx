// ExtractFullContent.tsx
import React, { useState, useRef, useEffect } from 'react';
import './ExtractFullContent.css';
import UploadInterface from '../UploadInterface';
import ExtractFullContentRightPanel_1 from './ExtractFullContentRightPanel_1';
import ExtractFullContentRightPanel_2 from './ExtractFullContentRightPanel_2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLoading } from '../FileContext';




interface ExtractFullContentProps {
      isActive: boolean;
      onFileChange: (file: File) => void;
      FullContent_apiResponse: any;
}


const ExtractFullContent: React.FC<ExtractFullContentProps> = ({ isActive, onFileChange, FullContent_apiResponse  }) => {
      const { isLoading } = useLoading();
      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files[0]) {
                  onFileChange(event.target.files[0]);
            }
      };
      const [markdown, setMarkdown] = useState('');
      useEffect(() => {
            if (FullContent_apiResponse) {
                setMarkdown(FullContent_apiResponse);
            }
        }, [FullContent_apiResponse]);
      const [showPanel, setShowPanel] = useState(1);  // State to toggle panels
      const togglePanel = async () => {
            setShowPanel(showPanel === 1 ? 2 : 1);
      };


      const [leftWidth, setLeftWidth] = useState(50); // Initial width in percentage
      const containerRef = useRef<HTMLDivElement>(null);

      const startResize = (event: React.MouseEvent) => {
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
      };

      const resize = (event: MouseEvent) => {
            if (containerRef.current) {
                  const containerWidth = containerRef.current.getBoundingClientRect().width;
                  const newLeftWidth = ((event.clientX - containerRef.current.getBoundingClientRect().left) / containerWidth) * 100;
                  if (newLeftWidth >= 65 && newLeftWidth <= 72) { // Constrain resizing
                  setLeftWidth(newLeftWidth);
                  }
            }
      };
      const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            };


    if (!isActive) return null;

    return (

      <div ref={containerRef} className="split-container">
            <div className="ExtractFullContent_left_panel" style={{ width: `${leftWidth}%` }}>
            {isLoading && (
                  <div className='ExtractFullContent_loading_container'>

                        <div className='ExtractFullContent_loading'>


                        </div>
                        <p>Extracting content from the document...</p>
                </div>
            )}
            {FullContent_apiResponse && !isLoading && (
                    <div className='ExtractFullContent_markdown'>

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                    </div>
                )}

            </div>
            <div className="ExtractFullContent_divider" onMouseDown={startResize}></div>
            <div className="ExtractFullContent_right_panel" style={{ width: `${100 - leftWidth}%` }}>

                  {showPanel === 1 ? (
                        <>
                    <ExtractFullContentRightPanel_1 onButtonClick={togglePanel} />
                    <div className="ExtractFullContent_upload_interface">
                        <UploadInterface   onChange={handleFileChange}  />
                  </div>
                        </>
                        ) : (
                              <ExtractFullContentRightPanel_2 onButtonClick={togglePanel} />
                  )}
                  {/* <div className="ExtractFullContent_upload_interface">
                        <UploadInterface   onChange={handleFileChange}  />
                  </div> */}

            </div>
        </div>






    );
};

export default ExtractFullContent;
