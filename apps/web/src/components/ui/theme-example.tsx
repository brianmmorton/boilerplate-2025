import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

/**
 * Example component demonstrating how to use the pink theme system
 * This shows different ways to apply your Radix pink palette throughout the app
 */
export function ThemeExample() {
  return (
    <div className="space-y-8 p-6">
      {/* Using Tailwind classes with your pink palette */}
      <section>
        <h2 className="mb-4">Using Pink Palette Scale</h2>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((scale) => (
            <div 
              key={scale}
              className={`p-4 rounded text-center bg-pink-${scale} ${scale > 8 ? 'text-white' : 'text-gray-900'}`}
            >
              {scale}
            </div>
          ))}
        </div>
      </section>

      {/* Using semantic brand colors */}
      <section>
        <h2 className="mb-4">Using Semantic Brand Colors</h2>
        <div className="space-y-4">
          <div className="p-4 bg-brand-subtle rounded">
            <p className="text-brand-text">Subtle background with brand text</p>
          </div>
          
          <div className="p-4 border-2 border-brand-ui rounded">
            <p>Border using brand UI color</p>
          </div>
          
          <div className="p-4 bg-brand-solid text-white rounded">
            <p>Solid brand background</p>
          </div>
        </div>
      </section>

      {/* Using predefined component classes */}
      <section>
        <h2 className="mb-4">Brand Component Classes</h2>
        <div className="space-y-4">
          <button className="btn-brand px-4 py-2 rounded">
            Brand Button
          </button>
          
          <div className="bg-brand-subtle border-brand rounded p-4">
            <h3 className="text-brand">Brand Card Header</h3>
            <p className="text-muted-foreground">Content using muted text</p>
          </div>
        </div>
      </section>

      {/* Using with shadcn components */}
      <section>
        <h2 className="mb-4">With shadcn Components</h2>
        <Card className="border-brand-ui">
          <CardHeader className="bg-brand-subtle">
            <CardTitle className="text-brand-text">Themed Card</CardTitle>
            <CardDescription>This card uses your pink theme</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4">Content area with normal styling</p>
            <Button className="bg-brand-solid hover:bg-pink-10 text-white">
              Themed Button
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Typography examples */}
      <section>
        <h2 className="mb-4">Typography with Theme</h2>
        <div className="space-y-2">
          <h1>Heading 1 - Uses text-foreground by default</h1>
          <h2 className="text-brand-text">Heading 2 - With brand text color</h2>
          <h3>Heading 3 - Default styling</h3>
          <p className="text-muted-foreground">Muted paragraph text</p>
          <p className="text-brand-text">Paragraph with brand color</p>
        </div>
      </section>
    </div>
  );
}

export default ThemeExample; 