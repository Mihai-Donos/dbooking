// resources/js/Components/UI/SoftTable.jsx

import React from "react";

export default function SoftTable({ columns, rows }) {
  return (
    <div className="soft-table-wrap">
      <div className="overflow-x-auto">
        <table className="soft-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.thClassName ?? ""}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.tdClassName ?? ""}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500">
                  Keine Treffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}