import { calculateImportBreakdown, calcularSkuRapido } from "./calculator-utils";
import {
  type OrderData,
  getOrderWeightGramos,
  getOrderCostCNY,
  getOrderCostUSD,
  getOrderCostARS,
} from "./order-database";
import { getAllSkus } from "./sku-database";

const SHIPPING_COST_PER_KG = 11.2;

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cell(value: string | number, style: string = "Default"): string {
  if (typeof value === "number" && !isNaN(value)) {
    return `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escapeXml(String(value ?? ""))}</Data></Cell>`;
}

function row(...cells: string[]): string {
  return `<Row>${cells.join("")}</Row>`;
}

export function exportOrderToExcel(order: OrderData) {
  const skus = getAllSkus();

  // ===== RESUMEN =====
  const pesoGramos = getOrderWeightGramos(order);
  const costoCNY = getOrderCostCNY(order);
  const costoUSD = getOrderCostUSD(order);
  const costoARS = getOrderCostARS(order);
  const totalUnidades = order.items.reduce((a, i) => a + i.cantidad, 0);

  const firstSku = skus.find(s => s.id === order.items[0]?.skuId);
  const resumenRows: string[] = [
    row(cell("ORDEN DE COMPRA - IMPORTFLOW", "Title")),
    row(),
    row(cell("Nombre", "Label"), cell(order.nombre)),
    row(cell("Proveedor", "Label"), cell(order.proveedor || "-")),
    row(cell("Estado", "Label"), cell(order.estado)),
    row(cell("Fecha", "Label"), cell(new Date(order.fechaCreacion).toLocaleDateString("es-AR"))),
    row(),
    row(cell("CONDICIONES", "Section")),
    row(cell("Tasa CNY/USD", "Label"), cell(firstSku?.exchangeRate ?? order.exchangeRate, "Decimal4")),
    row(cell("Tasa USD/ARS", "Label"), cell(firstSku?.usdToArsRate ?? order.usdToArsRate, "Decimal4")),
    row(cell("Peso Objetivo (kg)", "Label"), cell(+(order.pesoObjetivoGramos / 1000).toFixed(2))),
    row(cell("Flete x KG (USD)", "Label"), cell(SHIPPING_COST_PER_KG)),
    row(),
    row(cell("TOTALES", "Section")),
    row(cell("Peso Total (kg)", "Label"), cell(+(pesoGramos / 1000).toFixed(3))),
    row(cell("Costo Total CNY", "Label"), cell(+costoCNY.toFixed(2))),
    row(cell("Costo Total USD", "Label"), cell(+costoUSD.toFixed(2))),
    row(cell("Costo Total ARS", "Label"), cell(+costoARS.toFixed(2), "Money")),
    row(cell("Productos", "Label"), cell(order.items.length)),
    row(cell("Unidades", "Label"), cell(totalUnidades)),
    row(),
    row(cell("Notas", "Label"), cell(order.notas || "-")),
  ];

  // ===== DETALLE =====
  const detalleHeaders = row(
    cell("#", "Header"),
    cell("Producto", "Header"),
    cell("NCM", "Header"),
    cell("Cantidad", "Header"),
    cell("Precio Unit (CNY)", "Header"),
    cell("Peso Unit (g)", "Header"),
    cell("Subtotal (CNY)", "Header"),
    cell("Subtotal Peso (g)", "Header"),
    cell("FOB Unit (USD)", "Header"),
    cell("Flete Base (USD)", "Header"),
    cell("Seguro (USD)", "Header"),
    cell("DHL Manejo (USD)", "Header"),
    cell("Total Logistica (USD)", "Header"),
    cell("Flete Aduanero (USD)", "Header"),
    cell("CIF (USD)", "Header"),
    cell("DIE (USD)", "Header"),
    cell("Estadistica (USD)", "Header"),
    cell("IVA (USD)", "Header"),
    cell("Total Impuestos (USD)", "Header"),
    cell("Costo Total Unit (USD)", "Header"),
    cell("Costo Total Unit (ARS)", "Header"),
    cell("Costo x Cantidad (ARS)", "Header"),
    cell("Precio Venta ML (ARS)", "Header"),
    cell("Comision ML (ARS)", "Header"),
    cell("Costo FULL (ARS)", "Header"),
    cell("Envio Gratis (ARS)", "Header"),
    cell("Ganancia Neta Unit (ARS)", "Header"),
    cell("Margen (%)", "Header"),
    cell("Ganancia x Cantidad (ARS)", "Header"),
  );

  let totalGanancia = 0;

  const detalleRows = order.items.map((item, idx) => {
    const sku = skus.find(s => s.id === item.skuId);
    const precioVentaML = sku?.precioVentaML || 0;
    const itemExchangeRate = sku?.exchangeRate ?? order.exchangeRate;
    const itemUsdToArsRate = sku?.usdToArsRate ?? order.usdToArsRate;

    const bd = calculateImportBreakdown({
      itemValueCNY: item.precioCompraCNY,
      exchangeRate: itemExchangeRate,
      weight: item.pesoGramos,
      shippingCostPerKg: SHIPPING_COST_PER_KG,
      miscellaneous: 0,
      tariffRate: item.tariffRate,
      statisticalFee: item.statisticalFee,
      vatRate: item.vatRate,
      usdToArsRate: itemUsdToArsRate,
    });

    const calc = calcularSkuRapido(
      item.precioCompraCNY,
      itemExchangeRate,
      item.pesoGramos,
      SHIPPING_COST_PER_KG,
      precioVentaML,
      itemUsdToArsRate,
      item.tariffRate,
      item.statisticalFee,
      item.vatRate,
    );

    const gananciaTotal = calc.gananciaNetaARS * item.cantidad;
    totalGanancia += gananciaTotal;

    return row(
  cell(idx + 1),
  cell(item.nombre),
  cell(item.ncm || "-"),
  cell(item.cantidad),
  cell(item.precioCompraCNY, "Decimal2"),
  cell(item.pesoGramos),
  cell(+(item.precioCompraCNY * item.cantidad).toFixed(2), "Decimal2"),
  cell(item.pesoGramos * item.cantidad),
  cell(+bd.itemValueUSD.toFixed(2), "Decimal2"),
  cell(+bd.baseShipping.toFixed(2), "Decimal2"),
  cell(+bd.insurance.toFixed(2), "Decimal2"),
  cell(+bd.dhlHandlingFee.toFixed(2), "Decimal2"),
  cell(+bd.totalLogisticsUSD.toFixed(2), "Decimal2"),
  cell(+bd.customsFreight.toFixed(2), "Decimal2"),
  cell(+bd.cifValue.toFixed(2), "Decimal2"),
  cell(+bd.dutyAmount.toFixed(2), "Decimal2"),
  cell(+bd.statisticalAmount.toFixed(2), "Decimal2"),
  cell(+bd.vatAmount.toFixed(2), "Decimal2"),
  cell(+bd.totalTaxesUSD.toFixed(2), "Decimal2"),
  cell(+bd.totalAcquisitionCostUSD.toFixed(2), "Decimal2"),
  cell(+bd.totalAcquisitionCostARS.toFixed(2), "Decimal2"),
  cell(+(bd.totalAcquisitionCostARS * item.cantidad).toFixed(2), "Decimal2"),
  cell(precioVentaML),
  cell(+calc.comisionML.toFixed(2), "Decimal2"),
  cell(+calc.costoFijoML.toFixed(2), "Decimal2"),
  cell(+calc.envioGratisML.toFixed(2), "Decimal2"),
  cell(+calc.gananciaNetaARS.toFixed(2), "Decimal2"),
  cell(calc.margen),
  cell(+gananciaTotal.toFixed(2), "Decimal2"),
);
  });

  const totalRow = row(
    cell("", "Total"),
    cell("TOTAL", "Total"),
    cell("", "Total"),
    cell(totalUnidades, "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell(+costoCNY.toFixed(2), "Total"),
    cell(pesoGramos, "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell(+costoUSD.toFixed(2), "Total"),
    cell(+costoARS.toFixed(2), "Total"),
    cell(+costoARS.toFixed(2), "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell("", "Total"),
    cell(+totalGanancia.toFixed(2), "Total"),
  );

  // ===== CONSTRUIR XML =====
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">

  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1"/>
    </Style>
    <Style ss:ID="Section">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1E40AF"/>
    </Style>
    <Style ss:ID="Label">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#475569"/>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="Decimal4">
      <NumberFormat ss:Format="0.0000"/>
    </Style>
    <Style ss:ID="Decimal2">
      <NumberFormat ss:Format="0.00"/>
    </Style>
    <Style ss:ID="Money">
      <NumberFormat ss:Format="Fixed"/>
    </Style>
    <Style ss:ID="Total">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
      <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F59E0B"/>
      </Borders>
    </Style>
</Styles>

  <Worksheet ss:Name="Resumen">
    <Table>
      <Column ss:Width="160"/>
      <Column ss:Width="200"/>
      ${resumenRows.join("\n      ")}
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Detalle Productos">
    <Table>
      <Column ss:Width="30"/>
      <Column ss:Width="150"/>
      <Column ss:Width="70"/>
      <Column ss:Width="55"/>
      ${Array(25).fill('<Column ss:Width="85"/>').join("\n      ")}
      ${detalleHeaders}
      ${detalleRows.join("\n      ")}
      <Row/>
      ${totalRow}
    </Table>
  </Worksheet>

</Workbook>`;

  // Descargar como .xls
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `orden-${order.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.xls`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
