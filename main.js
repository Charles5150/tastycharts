import Papa, { parse } from 'papaparse';
import Chart from 'chart.js/auto';

console.log('hola');

const url = './tw.csv';

let chartChain;
let globalHeaders;

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  console.log('context', context);
  // Tooltip Element
  const {chart, tooltip} = context;
  console.log('tooltip title', tooltip.title);
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  /*
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    const tableHead = document.createElement('thead');

    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = 0;

      const th = document.createElement('th');
      th.style.borderWidth = 0;
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';

      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = 0;

      const td = document.createElement('td');
      td.style.borderWidth = 0;

      const text = document.createTextNode(body);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }
  */
  console.log('chartChain', chartChain);
  const dayChain = chartChain.find((item) => {
    return item.date === tooltip.title[0];
  });
  console.log('dayChain', dayChain);

  const tableHead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.borderWidth = 0;
  globalHeaders.forEach(title => {
    // const tr = document.createElement('tr');
    // tr.style.borderWidth = 0;

    const th = document.createElement('th');
    th.style.borderWidth = 0;
    const text = document.createTextNode(title);

    th.appendChild(text);
    tr.appendChild(th);
    tableHead.appendChild(tr);
  });
  const tableBody = document.createElement('tbody');
  dayChain.ops.forEach((body, i) => {
    const colors = tooltip.labelColors[i];
    const span = document.createElement('span');
    // span.style.background = colors.backgroundColor;
    // span.style.borderColor = colors.borderColor;
    span.style.borderWidth = '2px';
    span.style.marginRight = '10px';
    span.style.height = '10px';
    span.style.width = '10px';
    span.style.display = 'inline-block';

    const tr = document.createElement('tr');
    tr.style.backgroundColor = 'inherit';
    tr.style.borderWidth = 0;
    body.forEach((item) => {
      const td = document.createElement('td');
      td.style.borderWidth = 0;

      const text = document.createTextNode(item);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
    })
    tableBody.appendChild(tr);
  });
  const tableRoot = tooltipEl.querySelector('table');
  // Remove old children
  while (tableRoot.firstChild) {
    tableRoot.firstChild.remove();
  }
  // Add new children
  tableRoot.appendChild(tableHead);
  tableRoot.appendChild(tableBody);
  


  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.fontSize = tooltip.options.font.size;
  tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

const doChart = (chain) => {
  chartChain = chain;
  /*
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
  ];
  */
  const labels = [];
  const balance = [];
  const pl = [];
  const backgroundColors = [];
  chain.forEach((item) => {
    labels.push(item.date);
    balance.push(item.balance);
    pl.push(item.pl);
    backgroundColors.push(item.pl>=0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)');
  });

  const data = {
    labels: labels,
    datasets: [{
      label: 'balance',
      backgroundColor: backgroundColors,
      borderColor: 'rgb(255,255,255)',
      data: balance,
    },
    {
      label: 'p/l',
      backgroundColor: 'rgb(0, 0, 255)',
      borderColor: 'rgb(255, 99, 132)',
      data: pl,
    },
    ]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      },
      plugins: {
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: externalTooltipHandler,
          font: {
            size: 3,
          }
        }
      }
    }
  };

  const myChart = new Chart(
    document.getElementById('chart'),
    config
  );
}

function createTable(tableHeaders, tableData) {
  const table = document.createElement('table');
  const tableBody = document.createElement('tbody');

  const row = document.createElement('tr');
  tableHeaders.forEach(function(cellData) {
    const cell = document.createElement('td');
    cell.appendChild(document.createTextNode(cellData));
    row.appendChild(cell);
  });
  tableBody.appendChild(row);

  tableData.forEach(function(rowData) {
    const row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      const cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.body.appendChild(table);
}

const draw = (item, total, subtotal) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  element.style.width = total;
  element.style.height = 20;
  const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.innerHTML = subtotal;
  rectangle.appendChild(title);
  //rectangle.style.width = subtotal;
  //rectangle.style.height = 10;
  rectangle.style = `width:${total}px;height:10px;fill:rgb(12,34,56)`;

  element.appendChild(rectangle);
  document.body.appendChild(element);
};

const totals = (data , headers) => {
  let total = 0;
  const opened = {};
  let currentDate = '';
  const chain = [];
  let currentChain = {};
  let balance = 0;
  data.forEach((item) => {
    /*
    const date_filtered = item[headers.indexOf('date_ok')];
    if (date_filtered > '2022-06-24'){
      return;
    }
    */
  
    let value = parseFloat(item[headers.indexOf('Value')].replace(',', ''));
    let commissions = parseFloat(item[headers.indexOf('Commissions')].replace(',',''));
    let fees = parseFloat(item[headers.indexOf('Fees')].replace(',',''));
    value = isNaN(value) ? 0 : value;
    commissions = isNaN(commissions) ? 0 : commissions;
    fees = isNaN(fees) ? 0 : fees;
    // console.log(value, commissions, fees);
    const subtotal = value + commissions + fees;
      
    // console.log('subtotal', subtotal);
    total += subtotal;
    // draw(item, total, subtotal);
    const date_ok = item[headers.indexOf('date_ok')];
    if( date_ok !== currentDate ){
      if(currentChain.date){
        chain.push(currentChain);
        balance += currentChain.pl;
        currentChain.balance = balance;
      }
      currentDate = date_ok;
      currentChain = {date: currentDate, pl: 0, balance: 0, ops:[]};
      
    }
    currentChain.ops.push(item);
    const action = item[headers.indexOf('Action')];
    const symbol = item[headers.indexOf('Symbol')];
    if(action.includes('_TO_OPEN')){
      // opened[symbol] = item;
      if(!opened[symbol]){
        opened[symbol] = [];
      }
      opened[symbol].push(item);
      currentChain.pl += (commissions + fees);
      
    } else {
      const prevOpened = opened[symbol];
      console.log('prevOpened', prevOpened);
      let openedValue = 0;
      if(prevOpened){
        // openedValue = parseFloat(prevOpened[headers.indexOf('Value')].replace(',', ''));
        prevOpened.forEach((openedItem) => {
          openedValue += parseFloat(openedItem[headers.indexOf('Value')].replace(',', ''));
        });
        console.log('openedValue', openedValue);
        delete opened[symbol];
      }
      
      currentChain.pl += (value + commissions + fees + openedValue);
      // currentChain.balance = balance + currentChain.pl;
      
    };
    
  });
  chain.push(currentChain);
  currentChain.balance = balance + currentChain.pl;
  console.log('total', total);
  console.log('chain', chain);
  console.log('opened', opened);
  let totalReduced = 0;
  chain.forEach((item) => {
    totalReduced += item.pl;
  });
  console.log('totalReduced', totalReduced);
  globalHeaders = headers;
  doChart(chain);
}

const start = (original) => {
  let data = original.data;
  const headers = data.shift();
  data.pop();
  
  data.forEach((item) => {
    console.log('item', item);
    item.unshift(item[headers.indexOf('Date')].substr(0,10));
  });
  headers.unshift('date_ok');
  data = data.reverse();
  console.log('headers', headers);
  console.log('data', data);
  createTable(headers, data);
  totals(data , headers);
}

Papa.parse(url, {
  download: true,
  complete: function(results) {
      console.log(results);
      start(results);
  }
});