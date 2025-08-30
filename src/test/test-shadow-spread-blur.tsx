// src/test/test-shadow-spread-blur.tsx
/**
 * Test file to verify that drop shadow spread, blur with opacity, and border rendering work correctly
 * This test creates elements with various combinations of effects to ensure they render properly
 */

import React from 'react'
import { Stage, Layer, Rect, Text, Group } from 'react-konva'
import Konva from 'konva'
import { getKonvaShadowProps } from '@/utils/shadow.utils'
import { applyOpacityToColor } from '@/utils/color.utils'

const TestShadowSpreadBlur = () => {
  // Test element with shadow spread
  const testElement1 = {
    id: 'test1',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    style: {
      backgroundColor: '#3b82f6',
      dropShadow: {
        enabled: true,
        offsetX: 5,
        offsetY: 5,
        blur: 10,
        spread: 5, // Test spread property
        color: '#000000',
        opacity: 0.5
      }
    }
  }
  
  // Test element with blur and opacity
  const testElement2 = {
    id: 'test2',
    x: 200,
    y: 50,
    width: 100,
    height: 100,
    opacity: 0.5,
    style: {
      backgroundColor: '#ef4444', // Red color
      blur: 10,
      fillOpacity: 0.5
    }
  }
  
  // Test element with blur and border
  const testElement3 = {
    id: 'test3',
    x: 350,
    y: 50,
    width: 100,
    height: 100,
    style: {
      backgroundColor: '#10b981',
      borderColor: '#000000',
      borderWidth: 3,
      blur: 10
    }
  }
  
  // Test element with all effects combined
  const testElement4 = {
    id: 'test4',
    x: 50,
    y: 200,
    width: 150,
    height: 150,
    opacity: 0.7,
    style: {
      backgroundColor: '#f59e0b',
      borderColor: '#7c3aed',
      borderWidth: 4,
      borderRadius: 25,
      blur: 15,
      dropShadow: {
        enabled: true,
        offsetX: 10,
        offsetY: 10,
        blur: 20,
        spread: 10,
        color: '#000000',
        opacity: 0.3
      },
      fillOpacity: 0.8,
      borderOpacity: 0.9
    }
  }
  
  const renderElement = (element: any) => {
    const shadowProps = getKonvaShadowProps(element.style?.dropShadow)
    const needsCaching = element.style?.blur && element.style.blur > 0
    const hasBorder = element.style?.borderWidth && element.style.borderWidth > 0
    
    // Apply opacity to colors
    const fillOpacity = element.style?.fillOpacity ?? element.opacity ?? 1
    const borderOpacity = element.style?.borderOpacity ?? 1
    const fillColor = applyOpacityToColor(element.style?.backgroundColor || '#cccccc', fillOpacity)
    const strokeColor = hasBorder 
      ? applyOpacityToColor(element.style?.borderColor || '#000000', borderOpacity)
      : undefined
    
    return (
      <Group key={element.id}>
        {/* Main shape */}
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={element.style?.borderWidth || 0}
          cornerRadius={element.style?.borderRadius || 0}
          {...shadowProps}
          opacity={element.opacity ?? 1}
          filters={needsCaching ? [Konva.Filters.Blur] : undefined}
          blurRadius={element.style?.blur || 0}
        />
        
        {/* Label */}
        <Text
          x={element.x}
          y={element.y + element.height + 10}
          text={`Test ${element.id.replace('test', '')}`}
          fontSize={12}
          fill="#666"
        />
      </Group>
    )
  }
  
  React.useEffect(() => {
    // Apply caching to elements with blur
    const stage = document.querySelector('.konvajs-content canvas')
    if (stage) {
      console.log('Test elements rendered successfully')
      console.log('Element 1: Shadow with spread')
      console.log('Element 2: Blur with opacity (should maintain red color)')
      console.log('Element 3: Blur with border (border should be sharp)')
      console.log('Element 4: All effects combined')
    }
  }, [])
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Shadow Spread, Blur, and Border Test</h2>
      <p>This test verifies:</p>
      <ul>
        <li>Drop shadow spread property renders correctly</li>
        <li>Elements with blur and opacity maintain their color (not white)</li>
        <li>Borders remain sharp when blur is applied to the element</li>
        <li>All effects work together properly</li>
      </ul>
      
      <Stage width={600} height={400} style={{ border: '1px solid #ccc' }}>
        <Layer>
          {renderElement(testElement1)}
          {renderElement(testElement2)}
          {renderElement(testElement3)}
          {renderElement(testElement4)}
        </Layer>
      </Stage>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Expected Results:</h3>
        <ol>
          <li><strong>Element 1 (Blue):</strong> Should have a shadow with visible spread (expanded shadow area)</li>
          <li><strong>Element 2 (Red):</strong> Should be blurred and semi-transparent but maintain red color, not turn white</li>
          <li><strong>Element 3 (Green):</strong> Should be blurred but the border should remain sharp and clear</li>
          <li><strong>Element 4 (Orange):</strong> Should have all effects working together: shadow with spread, blur, sharp border, and proper opacity</li>
        </ol>
      </div>
    </div>
  )
}

export default TestShadowSpreadBlur
