// src/Summary.jsx
import React, { useMemo } from 'react';

const Summary = React.memo(({ data, exportToPDF, isExporting, steps, analyzeData }) => {

  // Prop validation
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    console.error("Summary: Invalid 'steps' prop.");
    return <div className="p-4 text-red-600">Erreur: Données étapes manquantes.</div>;
  }
  if (typeof analyzeData !== 'function') {
     console.error("Summary: Invalid 'analyzeData' prop.");
     return <div className="p-4 text-red-600">Erreur: Fonction analyse manquante.</div>;
  }

  // Memoized calculation of analysis results for all steps
  const analysisResults = useMemo(() => {
    if (!data) return {}; // Handle case where data might be initially undefined
    const results = {};
    steps.forEach(step => {
        if (data[step.id]?.text?.trim()) {
            results[step.id] = analyzeData(data, step); // Use the passed analyzeData function
        } else {
             results[step.id] = null; // Mark steps with no text as null
        }
    });
    return results;
  }, [data, steps, analyzeData]); // Recalculate only if data, steps, or analyzeData change

  // Memoized check if there's any analyzed data to display
  const hasAnalyzedData = useMemo(() =>
      Object.values(analysisResults).some(result => result !== null),
      [analysisResults]
  );

  // JSX Render
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative transition-opacity duration-300">
      {/* Exporting Indicator */}
      {isExporting && ( <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10 rounded-lg no-print"><p className="text-blue-600 font-semibold animate-pulse">Préparation...</p></div> )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 print:mb-2">
        <h2 className="text-xl font-semibold text-gray-900">Résumé du Projet ADDIE</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 no-print disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={exportToPDF}
          disabled={isExporting || !hasAnalyzedData}
          aria-label="Exporter en PDF"
          title={!hasAnalyzedData ? "Remplissez au moins une étape pour exporter" : "Exporter en PDF"}
        >
          Exporter PDF
        </button>
      </div>

      {/* Summary Content */}
      {hasAnalyzedData ? (
        <div className="space-y-5">
          {steps.map(step => {
            const analysis = analysisResults[step.id]; // Get pre-calculated analysis
            if (!analysis) return null; // Skip steps with no text

            const stepText = data?.[step.id]?.text?.trim() || '';
            const checklistItems = data[step.id]?.checklist || [];
            const checkedItems = checklistItems.filter(item => item.checked).length;
            const totalItems = step.checklist.length;

            return (
              <div key={step.id} className="border-b border-gray-200 pb-4 last:border-b-0 print:pb-2">
                <h3 className="text-lg font-medium text-gray-800 mb-1 print:text-base">{step.title}</h3>
                {/* Display full text */}
                <p className="text-gray-700 text-sm mb-2 print:text-xs whitespace-pre-wrap break-words">{stepText}</p>
                {/* Checklist Info */}
                {totalItems > 0 && ( <p className="text-gray-500 text-xs mb-2 print:text-2xs italic">Checklist : {checkedItems} / {totalItems} coché(s)</p> )}
                {/* Analysis Details */}
                <div className="mt-2 space-y-1 text-xs print:text-2xs"> {/* Smaller text for analysis */}
                    {analysis.coherence && ( <p className="text-orange-600 bg-orange-50 p-1 rounded border border-orange-200"><span className="font-semibold">Cohérence :</span> {analysis.coherence}</p> )}
                    {analysis.issues.length > 0 && (
                      <div>
                        <p className="text-red-600 font-semibold">Problèmes potentiels :</p>
                        <ul className="list-disc list-inside pl-2 text-red-500">
                          {analysis.issues.map((issue, idx) => <li key={`issue-${step.id}-${idx}`}>{issue}</li>)}
                        </ul>
                      </div>
                    )}
                    {analysis.suggestions.length > 0 && (
                      <div className="mt-1"> {/* Add margin-top if both issues and suggestions exist */}
                        <p className="text-blue-600 font-semibold">Suggestions :</p>
                        <ul className="list-disc list-inside pl-2 text-blue-500">
                          {analysis.suggestions.map((suggestion, idx) => <li key={`sugg-${step.id}-${idx}`}>{suggestion}</li>)}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Message when no data is entered
        <p className="text-gray-600 text-sm text-center py-6 italic">
          Aucune donnée saisie. Remplissez les étapes pour générer le résumé.
        </p>
      )}
    </div>
  );
});

export default Summary;

