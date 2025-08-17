// src/utils/svg-path-parser.ts

interface PathCommand {
  type: string
  values: number[]
}

/**
 * Parse SVG path data into commands
 */
export function parseSVGPath(pathData: string): PathCommand[] {
  const commands: PathCommand[] = []
  const pathRegex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g
  let match

  while ((match = pathRegex.exec(pathData)) !== null) {
    const type = match[1]
    const valuesStr = match[2].trim()
    const values = valuesStr.length > 0 
      ? valuesStr.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v))
      : []
    
    commands.push({ type, values })
  }

  return commands
}

/**
 * Draw SVG path commands on a canvas context
 */
export function drawSVGPath(ctx: CanvasRenderingContext2D, pathData: string) {
  const commands = parseSVGPath(pathData)
  let currentX = 0
  let currentY = 0
  let pathStartX = 0
  let pathStartY = 0
  let lastControlX = 0
  let lastControlY = 0

  ctx.beginPath()

  for (const cmd of commands) {
    const { type, values } = cmd

    switch (type) {
      case 'M': // Move to absolute
        currentX = values[0]
        currentY = values[1]
        pathStartX = currentX
        pathStartY = currentY
        ctx.moveTo(currentX, currentY)
        // Handle implicit line commands
        for (let i = 2; i < values.length; i += 2) {
          currentX = values[i]
          currentY = values[i + 1]
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'm': // Move to relative
        currentX += values[0]
        currentY += values[1]
        pathStartX = currentX
        pathStartY = currentY
        ctx.moveTo(currentX, currentY)
        // Handle implicit line commands
        for (let i = 2; i < values.length; i += 2) {
          currentX += values[i]
          currentY += values[i + 1]
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'L': // Line to absolute
        for (let i = 0; i < values.length; i += 2) {
          currentX = values[i]
          currentY = values[i + 1]
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'l': // Line to relative
        for (let i = 0; i < values.length; i += 2) {
          currentX += values[i]
          currentY += values[i + 1]
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'H': // Horizontal line absolute
        for (const x of values) {
          currentX = x
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'h': // Horizontal line relative
        for (const dx of values) {
          currentX += dx
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'V': // Vertical line absolute
        for (const y of values) {
          currentY = y
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'v': // Vertical line relative
        for (const dy of values) {
          currentY += dy
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'C': // Cubic bezier absolute
        for (let i = 0; i < values.length; i += 6) {
          ctx.bezierCurveTo(
            values[i], values[i + 1],
            values[i + 2], values[i + 3],
            values[i + 4], values[i + 5]
          )
          lastControlX = values[i + 2]
          lastControlY = values[i + 3]
          currentX = values[i + 4]
          currentY = values[i + 5]
        }
        break

      case 'c': // Cubic bezier relative
        for (let i = 0; i < values.length; i += 6) {
          ctx.bezierCurveTo(
            currentX + values[i], currentY + values[i + 1],
            currentX + values[i + 2], currentY + values[i + 3],
            currentX + values[i + 4], currentY + values[i + 5]
          )
          lastControlX = currentX + values[i + 2]
          lastControlY = currentY + values[i + 3]
          currentX += values[i + 4]
          currentY += values[i + 5]
        }
        break

      case 'S': // Smooth cubic bezier absolute
        for (let i = 0; i < values.length; i += 4) {
          // Mirror the previous control point
          const controlX = 2 * currentX - lastControlX
          const controlY = 2 * currentY - lastControlY
          
          ctx.bezierCurveTo(
            controlX, controlY,
            values[i], values[i + 1],
            values[i + 2], values[i + 3]
          )
          lastControlX = values[i]
          lastControlY = values[i + 1]
          currentX = values[i + 2]
          currentY = values[i + 3]
        }
        break

      case 's': // Smooth cubic bezier relative
        for (let i = 0; i < values.length; i += 4) {
          // Mirror the previous control point
          const controlX = 2 * currentX - lastControlX
          const controlY = 2 * currentY - lastControlY
          
          ctx.bezierCurveTo(
            controlX, controlY,
            currentX + values[i], currentY + values[i + 1],
            currentX + values[i + 2], currentY + values[i + 3]
          )
          lastControlX = currentX + values[i]
          lastControlY = currentY + values[i + 1]
          currentX += values[i + 2]
          currentY += values[i + 3]
        }
        break

      case 'Q': // Quadratic bezier absolute
        for (let i = 0; i < values.length; i += 4) {
          ctx.quadraticCurveTo(
            values[i], values[i + 1],
            values[i + 2], values[i + 3]
          )
          lastControlX = values[i]
          lastControlY = values[i + 1]
          currentX = values[i + 2]
          currentY = values[i + 3]
        }
        break

      case 'q': // Quadratic bezier relative
        for (let i = 0; i < values.length; i += 4) {
          ctx.quadraticCurveTo(
            currentX + values[i], currentY + values[i + 1],
            currentX + values[i + 2], currentY + values[i + 3]
          )
          lastControlX = currentX + values[i]
          lastControlY = currentY + values[i + 1]
          currentX += values[i + 2]
          currentY += values[i + 3]
        }
        break

      case 'T': // Smooth quadratic bezier absolute
        for (let i = 0; i < values.length; i += 2) {
          // Mirror the previous control point
          const controlX = 2 * currentX - lastControlX
          const controlY = 2 * currentY - lastControlY
          
          ctx.quadraticCurveTo(
            controlX, controlY,
            values[i], values[i + 1]
          )
          lastControlX = controlX
          lastControlY = controlY
          currentX = values[i]
          currentY = values[i + 1]
        }
        break

      case 't': // Smooth quadratic bezier relative
        for (let i = 0; i < values.length; i += 2) {
          // Mirror the previous control point
          const controlX = 2 * currentX - lastControlX
          const controlY = 2 * currentY - lastControlY
          
          ctx.quadraticCurveTo(
            controlX, controlY,
            currentX + values[i], currentY + values[i + 1]
          )
          lastControlX = controlX
          lastControlY = controlY
          currentX += values[i]
          currentY += values[i + 1]
        }
        break

      case 'A': // Arc absolute
        // Simplified arc handling - convert to bezier curves
        for (let i = 0; i < values.length; i += 7) {
          const rx = values[i]
          const ry = values[i + 1]
          const rotation = values[i + 2] * Math.PI / 180
          const largeArc = values[i + 3]
          const sweep = values[i + 4]
          const endX = values[i + 5]
          const endY = values[i + 6]
          
          // For now, just draw a line to the endpoint
          // Full arc implementation would be complex
          ctx.lineTo(endX, endY)
          currentX = endX
          currentY = endY
        }
        break

      case 'a': // Arc relative
        // Simplified arc handling
        for (let i = 0; i < values.length; i += 7) {
          currentX += values[i + 5]
          currentY += values[i + 6]
          ctx.lineTo(currentX, currentY)
        }
        break

      case 'Z':
      case 'z': // Close path
        ctx.closePath()
        currentX = pathStartX
        currentY = pathStartY
        break
    }
  }
}
