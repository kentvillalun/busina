// The table of Ecoaid: a card with a hairline border, a header row with a rule under it, 16px cell padding, 14px text and a thin
// line between rows. `columns` is [{ header, render(row) }]; the first column is bold, the rest muted (the render function can
// override that with its own classes). With `onRowClick` a row is clickable.
const DataTable = ({ columns, rows, onRowClick, selectedId }) => (
  <div className="w-full overflow-x-auto rounded-xl border-[0.5px] border-line bg-white px-4 md:px-8">
    <table className="w-full border-collapse text-nowrap text-sm">
      <thead className="border-b-[0.5px] border-line">
        <tr>
          {columns.map((column) => (
            <th key={column.header} className="p-4 text-start font-medium text-muted">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line/60">
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={onRowClick && (() => onRowClick(row.id))}
            className={`text-start transition-colors ${onRowClick ? "cursor-pointer hover:bg-stage/60" : ""} ${row.id === selectedId ? "bg-stage" : ""}`}
          >
            {columns.map((column, index) => (
              <td key={column.header} className={`p-4 ${index === 0 ? "font-semibold text-ink" : "text-muted"}`}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
