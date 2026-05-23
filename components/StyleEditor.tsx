'use client';

import { useState, useEffect } from 'react';

const defaultStyles = {
  bodyBgStart: '#f9fafb',
  bodyBgEnd: '#f1f5f9',
  cardBg: '#ffffff',
  btnPrimaryBgStart: '#4f46e5',
  btnPrimaryBgEnd: '#9333ea',
  btnPrimaryText: '#ffffff',
  btnSecondaryBg: '#e5e7eb',
  btnSecondaryText: '#1f2937',
  heading1Color: '#111827',
  heading2Color: '#111827',
  bodyTextColor: '#374151',
  labelTextColor: '#4b5563',
  resultTextColor: '#1f2937',
  btnPrimaryPx: '1rem',
  btnPrimaryPy: '0.5rem',
  btnPrimaryRadius: '0.5rem',
  btnPrimaryFontSize: '0.875rem',
  btnSecondaryPx: '1rem',
  btnSecondaryPy: '0.5rem',
  btnSecondaryRadius: '0.5rem',
  btnSecondaryFontSize: '0.875rem',
  heading1Size: '2.25rem',
  heading2Size: '1.875rem',
  globalFontSize: '1rem',
  cardRadius: '1rem',
};

// Helper to apply styles to CSS variables (live)
function applyStylesToDom(styles: typeof defaultStyles) {
  const root = document.documentElement;
  root.style.setProperty('--body-bg-start', styles.bodyBgStart);
  root.style.setProperty('--body-bg-end', styles.bodyBgEnd);
  root.style.setProperty('--card-bg', styles.cardBg);
  root.style.setProperty('--btn-primary-bg-start', styles.btnPrimaryBgStart);
  root.style.setProperty('--btn-primary-bg-end', styles.btnPrimaryBgEnd);
  root.style.setProperty('--btn-primary-text', styles.btnPrimaryText);
  root.style.setProperty('--btn-secondary-bg', styles.btnSecondaryBg);
  root.style.setProperty('--btn-secondary-text', styles.btnSecondaryText);
  root.style.setProperty('--heading1-color', styles.heading1Color);
  root.style.setProperty('--heading2-color', styles.heading2Color);
  root.style.setProperty('--body-text-color', styles.bodyTextColor);
  root.style.setProperty('--label-text-color', styles.labelTextColor);
  root.style.setProperty('--result-text-color', styles.resultTextColor);
  root.style.setProperty('--btn-primary-px', styles.btnPrimaryPx);
  root.style.setProperty('--btn-primary-py', styles.btnPrimaryPy);
  root.style.setProperty('--btn-primary-radius', styles.btnPrimaryRadius);
  root.style.setProperty('--btn-primary-font-size', styles.btnPrimaryFontSize);
  root.style.setProperty('--btn-secondary-px', styles.btnSecondaryPx);
  root.style.setProperty('--btn-secondary-py', styles.btnSecondaryPy);
  root.style.setProperty('--btn-secondary-radius', styles.btnSecondaryRadius);
  root.style.setProperty('--btn-secondary-font-size', styles.btnSecondaryFontSize);
  root.style.setProperty('--heading1-size', styles.heading1Size);
  root.style.setProperty('--heading2-size', styles.heading2Size);
  root.style.setProperty('--global-font-size', styles.globalFontSize);
  root.style.setProperty('--card-radius', styles.cardRadius);
}

export default function StyleEditor() {
  const [styles, setStyles] = useState(defaultStyles);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved styles on mount and apply them
  useEffect(() => {
    const saved = localStorage.getItem('uiStyles');
    if (saved) {
      const loaded = { ...defaultStyles, ...JSON.parse(saved) };
      setStyles(loaded);
      applyStylesToDom(loaded);
    } else {
      applyStylesToDom(defaultStyles);
    }
  }, []);

  // Handle any change (color, slider) – update state and apply live
  const updateStyles = (newStyles: typeof defaultStyles) => {
    setStyles(newStyles);
    applyStylesToDom(newStyles);
  };

  // Save current styles to localStorage
  const handleSave = () => {
    localStorage.setItem('uiStyles', JSON.stringify(styles));
  };

  const resetToDefault = () => {
    updateStyles(defaultStyles);
    localStorage.setItem('uiStyles', JSON.stringify(defaultStyles));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
        title="Style Editor"
      >
        🎨
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-black text-white rounded-lg shadow-xl p-4 z-50 border border-gray-700 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 sticky top-0 bg-black pb-2">
        <h3 className="font-bold">Style Editor</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Colors section */}
        <div>
          <h4 className="font-semibold mb-2">Colors</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label>Body gradient start</label><input type="color" value={styles.bodyBgStart} onChange={e => updateStyles({...styles, bodyBgStart: e.target.value})} className="w-full" /></div>
            <div><label>Body gradient end</label><input type="color" value={styles.bodyBgEnd} onChange={e => updateStyles({...styles, bodyBgEnd: e.target.value})} /></div>
            <div><label>Card background</label><input type="color" value={styles.cardBg} onChange={e => updateStyles({...styles, cardBg: e.target.value})} /></div>
            <div><label>Primary button start</label><input type="color" value={styles.btnPrimaryBgStart} onChange={e => updateStyles({...styles, btnPrimaryBgStart: e.target.value})} /></div>
            <div><label>Primary button end</label><input type="color" value={styles.btnPrimaryBgEnd} onChange={e => updateStyles({...styles, btnPrimaryBgEnd: e.target.value})} /></div>
            <div><label>Primary button text</label><input type="color" value={styles.btnPrimaryText} onChange={e => updateStyles({...styles, btnPrimaryText: e.target.value})} /></div>
            <div><label>Secondary button bg</label><input type="color" value={styles.btnSecondaryBg} onChange={e => updateStyles({...styles, btnSecondaryBg: e.target.value})} /></div>
            <div><label>Secondary button text</label><input type="color" value={styles.btnSecondaryText} onChange={e => updateStyles({...styles, btnSecondaryText: e.target.value})} /></div>
            <div><label>Heading 1 color</label><input type="color" value={styles.heading1Color} onChange={e => updateStyles({...styles, heading1Color: e.target.value})} /></div>
            <div><label>Heading 2 color</label><input type="color" value={styles.heading2Color} onChange={e => updateStyles({...styles, heading2Color: e.target.value})} /></div>
            <div><label>Body text color</label><input type="color" value={styles.bodyTextColor} onChange={e => updateStyles({...styles, bodyTextColor: e.target.value})} /></div>
            <div><label>Label text color</label><input type="color" value={styles.labelTextColor} onChange={e => updateStyles({...styles, labelTextColor: e.target.value})} /></div>
            <div><label>Result text color</label><input type="color" value={styles.resultTextColor} onChange={e => updateStyles({...styles, resultTextColor: e.target.value})} /></div>
          </div>
        </div>

        {/* Primary Button sizes */}
        <div>
          <h4 className="font-semibold mb-2">Primary Button</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label>Padding X (rem)</label><input type="range" min="0.5" max="2" step="0.1" value={parseFloat(styles.btnPrimaryPx)} onChange={e => updateStyles({...styles, btnPrimaryPx: e.target.value+'rem'})} /></div>
            <div><label>Padding Y (rem)</label><input type="range" min="0.25" max="1.5" step="0.1" value={parseFloat(styles.btnPrimaryPy)} onChange={e => updateStyles({...styles, btnPrimaryPy: e.target.value+'rem'})} /></div>
            <div><label>Radius (rem)</label><input type="range" min="0" max="2" step="0.1" value={parseFloat(styles.btnPrimaryRadius)} onChange={e => updateStyles({...styles, btnPrimaryRadius: e.target.value+'rem'})} /></div>
            <div><label>Font size (rem)</label><input type="range" min="0.75" max="1.5" step="0.05" value={parseFloat(styles.btnPrimaryFontSize)} onChange={e => updateStyles({...styles, btnPrimaryFontSize: e.target.value+'rem'})} /></div>
          </div>
        </div>

        {/* Secondary Button sizes */}
        <div>
          <h4 className="font-semibold mb-2">Secondary Button</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label>Padding X (rem)</label><input type="range" min="0.5" max="2" step="0.1" value={parseFloat(styles.btnSecondaryPx)} onChange={e => updateStyles({...styles, btnSecondaryPx: e.target.value+'rem'})} /></div>
            <div><label>Padding Y (rem)</label><input type="range" min="0.25" max="1.5" step="0.1" value={parseFloat(styles.btnSecondaryPy)} onChange={e => updateStyles({...styles, btnSecondaryPy: e.target.value+'rem'})} /></div>
            <div><label>Radius (rem)</label><input type="range" min="0" max="2" step="0.1" value={parseFloat(styles.btnSecondaryRadius)} onChange={e => updateStyles({...styles, btnSecondaryRadius: e.target.value+'rem'})} /></div>
            <div><label>Font size (rem)</label><input type="range" min="0.75" max="1.5" step="0.05" value={parseFloat(styles.btnSecondaryFontSize)} onChange={e => updateStyles({...styles, btnSecondaryFontSize: e.target.value+'rem'})} /></div>
          </div>
        </div>

        {/* Text sizes */}
        <div>
          <h4 className="font-semibold mb-2">Text Sizes</h4>
          <div className="grid grid-cols-2 gap-2">
            <div><label>Heading 1 (rem)</label><input type="range" min="1.5" max="3.5" step="0.1" value={parseFloat(styles.heading1Size)} onChange={e => updateStyles({...styles, heading1Size: e.target.value+'rem'})} /></div>
            <div><label>Heading 2 (rem)</label><input type="range" min="1.25" max="2.5" step="0.1" value={parseFloat(styles.heading2Size)} onChange={e => updateStyles({...styles, heading2Size: e.target.value+'rem'})} /></div>
            <div><label>Global font (rem)</label><input type="range" min="0.8" max="1.5" step="0.05" value={parseFloat(styles.globalFontSize)} onChange={e => updateStyles({...styles, globalFontSize: e.target.value+'rem'})} /></div>
            <div><label>Card radius (rem)</label><input type="range" min="0" max="2" step="0.1" value={parseFloat(styles.cardRadius)} onChange={e => updateStyles({...styles, cardRadius: e.target.value+'rem'})} /></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700">Save</button>
          <button onClick={resetToDefault} className="flex-1 bg-gray-600 text-white py-1 rounded hover:bg-gray-700">Reset to Default</button>
        </div>
      </div>
    </div>
  );
}