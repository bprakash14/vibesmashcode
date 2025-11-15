import React, { useState } from 'react';
import type { CodeReviewResult } from '../types';
import { TrafficLightScore } from '../types';
import { VulnerabilityCard } from './VulnerabilityCard';
import { GoodVibesChecklist } from './GoodVibesChecklist';
import { TRAFFIC_LIGHT_STYLES } from '../constants';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, DownloadIcon } from './Icons';

// Add declarations for CDN libraries to satisfy TypeScript
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface ReviewResultProps {
  result: CodeReviewResult;
  onVibeChange: (newVibe: string | null, oldVibe: string | null) => void;
}

interface TrafficLightProps {
  score: TrafficLightScore;
  onExport: () => void;
  isExporting: boolean;
}

const TrafficLight: React.FC<TrafficLightProps> = ({ score, onExport, isExporting }) => {
  const { color, bgColor, text } = TRAFFIC_LIGHT_STYLES[score];

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border-2 border-black shadow-[8px_8px_0px_#000]">
      <div className="flex space-x-3 p-3 bg-gray-800 border-2 border-black">
        <div className={`w-12 h-12 border-2 border-black ${score === TrafficLightScore.Red ? 'bg-red-500' : 'bg-gray-600'}`}></div>
        <div className={`w-12 h-12 border-2 border-black ${score === TrafficLightScore.Yellow ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
        <div className={`w-12 h-12 border-2 border-black ${score === TrafficLightScore.Green ? 'bg-green-500' : 'bg-gray-600'}`}></div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center flex-wrap gap-4 w-full">
         <h2 className={`text-3xl font-black text-center ${color}`}>{text}</h2>
         <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 mt-2 sm:mt-0 bg-blue-500 text-white font-bold py-2 px-4 border-2 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            aria-label="Export report as PDF"
          >
            <DownloadIcon className="h-5 w-5" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
         </button>
      </div>
    </div>
  );
};


export const ReviewResult: React.FC<ReviewResultProps> = ({ result, onVibeChange }) => {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleVibeClick = (vibe: string) => {
    const oldVibe = selectedVibe;
    const newVibe = oldVibe === vibe ? null : vibe;
    setSelectedVibe(newVibe);
    onVibeChange(newVibe, oldVibe);
  };
    
  const handleExportPDF = async () => {
    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        alert('PDF export libraries are still loading. Please try again in a moment.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const reportElement = document.getElementById('report-container');
    if (!reportElement) {
        console.error("Report element not found");
        return;
    }

    setIsExporting(true);
    
    // Temporarily hide the export button's shadow to prevent it from being badly rendered in the canvas
    const exportButton = reportElement.querySelector('button[aria-label="Export report as PDF"]') as HTMLElement | null;
    const originalShadow = exportButton ? exportButton.style.boxShadow : '';
    if (exportButton) exportButton.style.boxShadow = 'none';

    try {
        const canvas = await window.html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#F1F1F1'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate the height of the image scaled to fit the PDF width
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add new pages if the content is taller than one page
        while (heightLeft > 0) {
          position -= pdfHeight; // Move the image "up" for the next page
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save('VibeSmashCode-Report.pdf');

    } catch (error) {
        console.error("Failed to generate PDF", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        if (exportButton) exportButton.style.boxShadow = originalShadow;
        setIsExporting(false);
    }
  };

  const ActionButton: React.FC<{ 
    children: React.ReactNode, 
    value: string,
    glowColor: string,
  }> = ({ children, value, glowColor }) => {
      const isSelected = selectedVibe === value;
      const baseClasses = 'flex items-center gap-2 px-4 py-2 bg-white text-black font-bold border-2 border-black transition-all duration-200';
      const unselectedClasses = 'shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-y-0 active:translate-x-0 active:shadow-none';
      const selectedClasses = `shadow-[4px_4px_0px_#000,0_0_15px_${glowColor}] scale-105`;

      const style: React.CSSProperties = {};
      let childrenToRender = children;

      if (isSelected) {
        style.color = glowColor;
        style.textShadow = `0 0 8px ${glowColor}`;

        childrenToRender = React.Children.map(children, child => {
            if (React.isValidElement<{ className?: unknown }>(child) && typeof child.props.className === 'string') {
                const newClassName = child.props.className.split(' ').filter((c: string) => !c.startsWith('text-')).join(' ');
                return React.cloneElement(child, { className: newClassName });
            }
            return child;
        });
      }

      return (
         <button 
            onClick={() => handleVibeClick(value)}
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
            style={style}
          >
            {childrenToRender}
        </button>
      );
  };

  return (
    <>
      <div id="report-container" className="space-y-6">
        <TrafficLight score={result.overallScore} onExport={handleExportPDF} isExporting={isExporting} />

        {result.goodVibes && result.goodVibes.length > 0 && (
          <GoodVibesChecklist checks={result.goodVibes} />
        )}
        
        <div className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_#000] space-y-4">
          <h3 className="text-2xl font-bold text-black">Detailed Breakdown</h3>
          {result.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              {result.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard key={index} vulnerability={vuln} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-700 py-4 font-semibold">No vulnerabilities found. That's a clean vibe!</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 flex-wrap mt-6">
          <ActionButton value="vibe" glowColor="#16a34a">
            <CheckCircleIcon className="h-5 w-5 text-green-600" /> Vibe!
          </ActionButton>
          <ActionButton value="hmm" glowColor="#ca8a04">
            <InformationCircleIcon className="h-5 w-5 text-yellow-600" /> Hmm...
          </ActionButton>
          <ActionButton value="not-my-vibe" glowColor="#dc2626">
            <XCircleIcon className="h-5 w-5 text-red-600" /> Not my vibe
          </ActionButton>
      </div>
    </>
  );
};