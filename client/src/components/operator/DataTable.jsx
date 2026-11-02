import { Empty, ErrorState, Loading } from "@/components/operator/states";

// The table of Ecoaid: a card with a hairline border, a header row with a rule under it, 16px cell padding, 14px text and a thin
// line between rows. `columns` is [{ header, render(row) }]; the first column is bold, the rest muted.
// Below md the same rows are cards: `card(row)` renders the inside of one. With `onRowClick` a row or card is clickable.
// With no rows, a message of fixed height takes the place of the rows (in the table body and in the card list):
// `error` (with a button that calls `onRetry`) wins, then `loading`, then the empty message.
// `labels` is { loading, empty, error } as [main, sub] pairs; `retry` is the button text.
const DataTable = ({ columns, rows, card, onRowClick, selectedId, loading = false, error = false, onRetry, labels = {} }) => {
  const [loadingText, loadingSub] = labels.loading ?? [];
  const [emptyText, emptySub] = labels.empty ?? [];
  const [errorText, errorSub] = labels.error ?? [];

  const state = error ? (
    <ErrorState onRetry={onRetry} text={errorText} subtext={errorSub} />
  ) : loading ? (
    <Loading text={loadingText} subtext={loadingSub} />
  ) : rows.length === 0 ? (
    <Empty text={emptyText} subtext={emptySub} />
  ) : null;

  return (
    <>
      <div className="hidden w-full overflow-x-auto rounded-xl border-[0.5px] border-line bg-white px-8 md:block">
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
            {state ? (
              <tr>
                <td colSpan={columns.length}>{state}</td>
              </tr>
            ) : (
              rows.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {state ? (
          <div className="rounded-xl border-[0.5px] border-line bg-white">{state}</div>
        ) : (
          rows.map((row) => {
            const look = `w-full rounded-xl border-[0.5px] border-line p-4 text-left ${row.id === selectedId ? "bg-stage" : "bg-white"}`;
            return onRowClick ? (
              <button key={row.id} type="button" onClick={() => onRowClick(row.id)} className={`${look} active:bg-stage`}>
                {card(row)}
              </button>
            ) : (
              <div key={row.id} className={look}>
                {card(row)}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default DataTable;
