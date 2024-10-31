import React from 'react';
import './ExtractFullContentRightPanel_1.css';
import { useFileContext, useLoading } from '../FileContext';

const ExtractFullContentRightPanel_1: React.FC<{ onButtonClick: () => void }> = ({ onButtonClick }) => {
    const { ParsePostServer } = useFileContext();
    const { isLoading,setIsLoading } = useLoading();

    const handleExtractClick = async () => {
        setIsLoading(true);
        try {
            await ParsePostServer();
            onButtonClick();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='ExtractFullContentRightPanel_1_container'>
            {isLoading && (
                <div className='ExtractFullContentRightPanel_1_loading_overlay'>
                </div>
            )}
            <button className="ExtractFullContent_extract_button" onClick={handleExtractClick}>
                <img src='/Sanbox Icon and images\Sanbox Icon and images\RightPanel\Download.png' className='ExtractFullContent_Dwld_icon' alt='Download_Icon' />
                Extract Full Content
            </button>
            <div>
                  <li className="ExtractFullContent_checkbox_list">
                        <h3 className="ExtractFullContent_header">Leave-out Info</h3>
                        <label>
                              <input type="checkbox" /> Personal ID Info
                        </label>
                        <label>
                              <input type="checkbox" /> Page Number
                        </label>
                        <label>
                              <input type="checkbox" /> Footnote
                        </label>
                        <label>
                              <input type="checkbox" /> Header & Footers
                        </label>
                        <label>
                              <input type="checkbox" /> Tables
                        </label>
                        <label>
                              <input type="checkbox" /> Charts & Figures
                        </label>
                  </li>

            </div>
        </div>
    );
};

export default ExtractFullContentRightPanel_1;

