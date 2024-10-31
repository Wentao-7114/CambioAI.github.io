import React from 'react';
import './KeyValueApiResponseTable.css';
const KeyValueApiResponseTable = ({ data }: any) => {
    if (!data || Object.keys(data).length === 0) return <p>No data available</p>;


    return (
        <div className="api-response-table-container">
            <table className="api-response-table">
                <tbody>
                    {Object.entries(data).map(([key, value]: any) => (
                        <tr key={key}>
                            <th>{key}</th>
                              <td>{value.join(", ")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default KeyValueApiResponseTable;
