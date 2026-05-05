import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TreeMarker, STATUS_LABELS, CONDITION_LABELS, LIFE_STATUS_LABELS } from '@/types';

interface Props {
  trees: TreeMarker[];
}

export default function ExportPanel({ trees }: Props) {
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(trees, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dendro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['№','Название','Порода','Диаметр (см)','Высота (м)','Количество','Возраст','Состояние','Жизненное состояние','Жизнеспособность','Адрес','Широта','Долгота','Дата','Примечание'];
    const sorted  = [...trees].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    const rows    = sorted.map((t, i) => [
      t.number ?? (i + 1), t.name, t.species, t.diameter, t.height, t.count,
      t.age ?? '',
      STATUS_LABELS[t.status] ?? t.status,
      CONDITION_LABELS[t.condition] ?? t.condition,
      LIFE_STATUS_LABELS[t.lifeStatus] ?? t.lifeStatus,
      t.address ?? '', t.lat.toFixed(6), t.lng.toFixed(6), t.createdAt,
      t.description ?? '',
    ]);
    const csv  = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dendro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportKML = () => {
    const placemarks = trees.map(t => `
    <Placemark>
      <name>${t.name}</name>
      <description><![CDATA[
        Порода: ${t.species}<br/>
        Диаметр: ${t.diameter} см<br/>
        Высота: ${t.height} м<br/>
        Количество: ${t.count} шт<br/>
        Состояние: ${STATUS_LABELS[t.status] ?? t.status}<br/>
        ${t.description ? `Примечание: ${t.description}` : ''}
      ]]></description>
      <Point><coordinates>${t.lng},${t.lat},0</coordinates></Point>
    </Placemark>`).join('');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Дендрологическая ведомость города Минусинска и Минусинского района</name>
    <description>Экспорт от ${new Date().toLocaleDateString('ru-RU')}</description>
    ${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dendro_${new Date().toISOString().split('T')[0]}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[var(--forest-pale)] rounded-lg flex items-center justify-center">
          <Icon name="Download" size={16} className="text-[var(--forest-mid)]" />
        </div>
        <div>
          <div className="font-semibold text-[var(--forest-dark)] text-sm font-heading">Экспорт данных</div>
          <div className="text-xs text-[var(--stone)]">{trees.length} объектов</div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={exportKML}
          className="w-full justify-start gap-3 bg-[var(--forest-pale)] hover:bg-[var(--forest-light)]/20 text-[var(--forest-dark)] border border-[var(--forest-light)]/30 font-medium"
          variant="outline"
        >
          <Icon name="Globe" size={16} className="text-[var(--forest-mid)]" />
          Экспорт в KML (Google Earth)
        </Button>

        <Button
          onClick={exportCSV}
          className="w-full justify-start gap-3 bg-white hover:bg-green-50 text-[var(--forest-dark)] border border-[var(--border)] font-medium"
          variant="outline"
        >
          <Icon name="Sheet" fallback="Table" size={16} className="text-green-600" />
          Экспорт в CSV (Excel)
        </Button>

        <Button
          onClick={exportJSON}
          className="w-full justify-start gap-3 bg-white hover:bg-blue-50 text-[var(--forest-dark)] border border-[var(--border)] font-medium"
          variant="outline"
        >
          <Icon name="FileJson" fallback="File" size={16} className="text-blue-500" />
          Экспорт в JSON (резервная копия)
        </Button>
      </div>
    </div>
  );
}
