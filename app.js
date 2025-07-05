const app = document.getElementById('app')

const defaultRowNames = ['X', 'Y', 'Z', 'W', 'V']
const defaultColNames = ['A', 'B', 'C', 'D', 'E']

function renderForm(rows = 2, cols = 2, lastMatrix = null, nash = [], logicText = '', names = null, selectedCell = null) {
  let jugador1 = names?.jugador1 || 'Jugador 1'
  let jugador2 = names?.jugador2 || 'Jugador 2'
  let rowNames = names?.rowNames || defaultRowNames.slice(0, rows)
  let colNames = names?.colNames || defaultColNames.slice(0, cols)

  let html = `<form id='naming-form' class='section-form'>`
  html += `<div class='naming-row'><label>Nombre Jugador 1: <input type='text' id='jugador1' value='${jugador1}'></label>`
  html += `<label>Nombre Jugador 2: <input type='text' id='jugador2' value='${jugador2}'></label></div>`
  html += `<div class='naming-row'><label>Estrategias ${jugador1} (separadas por coma): <input type='text' id='rowNames' value='${rowNames.join(',')}'></label>`
  html += `<label>Estrategias ${jugador2} (separadas por coma): <input type='text' id='colNames' value='${colNames.join(',')}'></label></div>`
  html += `<button type='button' id='set-names'>Actualizar nombres</button>`
  html += `</form>`

  html += `<form id='matrix-form' class='section-form'>`
  html += `<div class='naming-row'><label>Filas (${jugador1}): <input type='number' id='rows' min='2' max='5' value='${rows}'></label>`
  html += `<label>Columnas (${jugador2}): <input type='number' id='cols' min='2' max='5' value='${cols}'></label></div>`
  html += `<button type='button' id='set-size'>Actualizar matriz</button>`
  html += `<div class='table-scroll'><table id='payoff-table'><thead>`
  html += `<tr><th rowspan='2' colspan='2'></th><th colspan='${cols}'>${jugador2}</th></tr>`
  html += `<tr>`
  for (let j = 0; j < cols; j++) {
    html += `<th>${colNames[j]}</th>`
  }
  html += `</tr></thead><tbody>`
  for (let i = 0; i < rows; i++) {
    html += `<tr>`
    if (i === 0) html += `<th rowspan='${rows}'>${jugador1}</th>`
    html += `<th>${rowNames[i]}</th>`
    for (let j = 0; j < cols; j++) {
      let val = ''
      if (lastMatrix) {
        val = lastMatrix[i][j].join(',')
      }
      html += lastMatrix
        ? `<td class='payoff-cell payoff-btn' data-cell='${i},${j}' tabindex='0'>`
        : `<td>`
      if (!lastMatrix) {
        html += `<input type='text' name='cell-${i}-${j}' placeholder='a,b' size='5'>`
      } else {
        let isNash = nash.some(([ni, nj]) => ni === i && nj === j)
        let a = lastMatrix[i][j][0]
        let b = lastMatrix[i][j][1]
        let p1Class = ''
        let p2Class = ''
        if (isNash) {
          p1Class = 'nash-p1'
          p2Class = 'nash-p2'
        }
        html += `<span class='p1 ${p1Class}'>${a}</span>,<span class='p2 ${p2Class}'>${b}</span>`
      }
      html += `</td>`
    }
    html += '</tr>'
  }
  html += `</tbody></table></div>`
  if (!lastMatrix) {
    html += `<button type='submit'>Calcular equilibrio de Nash</button>`
  }
  html += `</form><div id='result'></div>`
  if (lastMatrix) {
    html += `<div class='logic-text'>${logicText}</div>`
    html += `<button id='volver'>Volver</button>`
  }
  app.innerHTML = html

  document.getElementById('set-names').onclick = () => {
    const newJugador1 = document.getElementById('jugador1').value
    const newJugador2 = document.getElementById('jugador2').value
    const newRowNames = document.getElementById('rowNames').value.split(',').map(x => x.trim()).filter(Boolean)
    const newColNames = document.getElementById('colNames').value.split(',').map(x => x.trim()).filter(Boolean)
    renderForm(newRowNames.length, newColNames.length, null, [], '', {
      jugador1: newJugador1,
      jugador2: newJugador2,
      rowNames: newRowNames,
      colNames: newColNames
    })
  }

  if (!lastMatrix) {
    document.getElementById('set-size').onclick = () => {
      const newRows = parseInt(document.getElementById('rows').value)
      const newCols = parseInt(document.getElementById('cols').value)
      renderForm(newRows, newCols, null, [], '', {
        jugador1,
        jugador2,
        rowNames,
        colNames
      })
    }
    document.getElementById('matrix-form').onsubmit = (e) => {
      e.preventDefault()
      const matrix = []
      for (let i = 0; i < rows; i++) {
        const row = []
        for (let j = 0; j < cols; j++) {
          const val = document.querySelector(`[name='cell-${i}-${j}']`).value.trim()
          const [a, b] = val.split(',').map(Number)
          row.push([a, b])
        }
        matrix.push(row)
      }
      const nash = findNashEquilibria(matrix)
      const logicText = buildLogicText(matrix, nash, {jugador1, jugador2, rowNames, colNames})
      renderForm(rows, cols, matrix, nash, logicText, {jugador1, jugador2, rowNames, colNames})
      // Mostrar explicación de la primera celda por defecto
      setTimeout(() => showNashExplanation(0, 0, matrix, nash, {jugador1, jugador2, rowNames, colNames}), 100)
    }
  } else {
    document.getElementById('volver').onclick = () => renderForm(rows, cols, null, [], '', names)
  }

  if (lastMatrix) {
    document.querySelectorAll('.payoff-cell').forEach(el => {
      el.onclick = (e) => {
        const [i, j] = el.getAttribute('data-cell').split(',').map(Number)
        showNashExplanation(i, j, lastMatrix, nash, names)
      }
    })
    // Mostrar explicación de la primera celda si no hay ninguna seleccionada
    if (!selectedCell) showNashExplanation(0, 0, lastMatrix, nash, names)
  }
}

function findNashEquilibria(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  // Para cada fila, encontrar la mejor opción para el Jugador 2 (solo la primera si hay empate)
  let bestCols = Array(rows).fill(-1)
  for (let i = 0; i < rows; i++) {
    let maxB = -Infinity
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j][1] > maxB) maxB = matrix[i][j][1]
    }
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j][1] === maxB) {
        bestCols[i] = j
        break
      }
    }
  }
  // Para cada columna, encontrar la mejor opción para el Jugador 1 (solo la primera si hay empate)
  let bestRows = Array(cols).fill(-1)
  for (let j = 0; j < cols; j++) {
    let maxA = -Infinity
    for (let i = 0; i < rows; i++) {
      if (matrix[i][j][0] > maxA) maxA = matrix[i][j][0]
    }
    for (let i = 0; i < rows; i++) {
      if (matrix[i][j][0] === maxA) {
        bestRows[j] = i
        break
      }
    }
  }
  // Nash puro: intersección de ambas
  const nash = []
  for (let i = 0; i < rows; i++) {
    let j = bestCols[i]
    if (j !== -1 && bestRows[j] === i) {
      nash.push([i, j])
    }
  }
  return nash
}

function buildLogicText(matrix, nash, names) {
  const rows = matrix.length
  const cols = matrix[0].length
  let txt = ''
  // Lógica para jugador 2
  for (let i = 0; i < rows; i++) {
    txt += `• Si el jugador 1 elige la estrategia ${names.rowNames[i]}, la mejor opción para el jugador 2 es `
    let best = []
    let max = -Infinity
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j][1] > max) max = matrix[i][j][1]
    }
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j][1] === max) best.push(names.colNames[j])
    }
    txt += best.join(' o ') + ', pues '
    let comps = []
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j][1] !== max) comps.push(`${matrix[i][j][1]}<${max}`)
    }
    txt += comps.join(' y ') + '.<br>'
  }
  // Lógica para jugador 1
  for (let j = 0; j < cols; j++) {
    txt += `• Si el jugador 2 elige la estrategia ${names.colNames[j]}, la mejor opción para el jugador 1 es `
    let best = []
    let max = -Infinity
    for (let i = 0; i < rows; i++) {
      if (matrix[i][j][0] > max) max = matrix[i][j][0]
    }
    for (let i = 0; i < rows; i++) {
      if (matrix[i][j][0] === max) best.push(names.rowNames[i])
    }
    txt += best.join(' o ') + ', pues '
    let comps = []
    for (let i = 0; i < rows; i++) {
      if (matrix[i][j][0] !== max) comps.push(`${matrix[i][j][0]}<${max}`)
    }
    txt += comps.join(' y ') + '.<br>'
  }
  return txt
}

function showNashExplanation(i, j, matrix, nash, names) {
  const isNash = nash.some(([ni, nj]) => ni === i && nj === j)
  let txt = `<b>Celda (${names.rowNames[i]}, ${names.colNames[j]})</b><br>`
  txt += `Pagos: <b>${names.jugador1}</b>: ${matrix[i][j][0]}, <b>${names.jugador2}</b>: ${matrix[i][j][1]}<br>`
  if (isNash) {
    txt += `<b>Esta celda es un equilibrio de Nash.</b><br>`
    txt += `Ningún jugador puede mejorar su pago cambiando unilateralmente de estrategia.`
  } else {
    txt += `<b>Esta celda NO es un equilibrio de Nash.</b><br>`
    // Jugador 1: ¿puede mejorar?
    let mejor1 = matrix[i][j][0]
    let mejores1 = []
    for (let k = 0; k < matrix.length; k++) {
      if (matrix[k][j][0] > mejor1) mejores1.push({estrategia: names.rowNames[k], valor: matrix[k][j][0]})
    }
    if (mejores1.length > 0) {
      txt += `<br><b>${names.jugador1}</b> puede mejorar cambiando a: `
      txt += mejores1.map(m => `${m.estrategia} (gana ${m.valor})`).join(', ')
      txt += `.`
    } else {
      txt += `<br><b>${names.jugador1}</b> no puede mejorar su pago cambiando de estrategia.`
    }
    // Jugador 2: ¿puede mejorar?
    let mejor2 = matrix[i][j][1]
    let mejores2 = []
    for (let k = 0; k < matrix[0].length; k++) {
      if (matrix[i][k][1] > mejor2) mejores2.push({estrategia: names.colNames[k], valor: matrix[i][k][1]})
    }
    if (mejores2.length > 0) {
      txt += `<br><b>${names.jugador2}</b> puede mejorar cambiando a: `
      txt += mejores2.map(m => `${m.estrategia} (gana ${m.valor})`).join(', ')
      txt += `.`
    } else {
      txt += `<br><b>${names.jugador2}</b> no puede mejorar su pago cambiando de estrategia.`
    }
  }
  // Mostrar solo en el panel lateral
  const side = document.getElementById('side-nash-explanation')
  if (side) side.innerHTML = txt
}

renderForm() 
