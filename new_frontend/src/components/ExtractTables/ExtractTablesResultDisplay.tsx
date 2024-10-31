import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ExtractTablesResultDisplay.css';

interface ExtractTablesResultDisplayProps {
    content: string[];
}

const ExtractTablesResultDisplay: React.FC<ExtractTablesResultDisplayProps> = ({ content }) => {
    const isHTML = (str: string) => {
        return str.trim().toLowerCase().startsWith('<');
    };

    const renderContent = () => {
        if (!content || content.length === 0) {
            return <p>No tables found in the document</p>;
        }

        // Check first string to determine if we're dealing with HTML or Markdown
        const isHtmlContent = isHTML(content[0]);

        return content.map((item, index) => (
            <div key={index} className="table-container">
                <div className="table-scroll-container">
                    {isHtmlContent ? (
                        <div
                            className="html-content"
                            dangerouslySetInnerHTML={{ __html: item }}
                        />
                    ) : (
                        <div className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="extract-tables-result">
            {renderContent()}
        </div>
    );
};

export default ExtractTablesResultDisplay;