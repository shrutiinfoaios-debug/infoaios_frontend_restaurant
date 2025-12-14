import { Card, CardContent } from '@/components/ui/card';
import { Armchair } from 'lucide-react';

interface TableLayoutProps {
  numberOfTables: number;
  onTableClick: (tableNumber: number) => void;
}

const TableLayout = ({ numberOfTables, onTableClick }: TableLayoutProps) => {
  const tables = Array.from({ length: numberOfTables }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-7 gap-4">
      {tables.map((tableNumber) => (
        <Card key={tableNumber} className="cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => onTableClick(tableNumber)}>
          <CardContent className="flex flex-col items-center justify-center p-4 aspect-square">
            <Armchair className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold text-lg">{tableNumber}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TableLayout;