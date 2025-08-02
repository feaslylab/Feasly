import { useTranslation } from "react-i18next";

interface SheetCompareProps {}

export function SheetCompare({}: SheetCompareProps) {
  const { t } = useTranslation('common');

  const comparisonData = [
    {
      metric: "Build time",
      feasly: "Minutes",
      spreadsheet: "Days – weeks"
    },
    {
      metric: "Error risk", 
      feasly: "Very low (audit logs)",
      spreadsheet: "High (manual formulas)"
    },
    {
      metric: "Zakat / VAT",
      feasly: "Built-in",
      spreadsheet: "Manual"
    },
    {
      metric: "Scenarios",
      feasly: "One click", 
      spreadsheet: "Copy-paste"
    }
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Feasly vs Spreadsheets
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-6 text-lg font-semibold text-foreground border-b border-border">
                    Feature
                  </th>
                  <th className="text-center p-6 text-lg font-semibold text-primary border-b border-border">
                    {t('compare.column.feasly')}
                  </th>
                  <th className="text-center p-6 text-lg font-semibold text-muted-foreground border-b border-border">
                    {t('compare.column.sheet')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.metric} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-6 font-medium text-foreground">
                      {row.metric}
                    </td>
                    <td className="p-6 text-center text-success font-semibold">
                      {row.feasly}
                    </td>
                    <td className="p-6 text-center text-muted-foreground">
                      {row.spreadsheet}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}