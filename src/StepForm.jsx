import React, { useCallback } from 'react';

const StepForm = React.memo(({ step, data, setData, errors }) => {
  const handleTextChange = useCallback((e) => {
    setData(prev => ({
      ...prev,
      [step.id]: { ...prev[step.id], text: e.target.value }
    }));
  }, [step.id, setData]);

  const handleChecklistChange = useCallback((index) => {
    setData(prev => ({
      ...prev,
      [step.id]: {
        ...prev[step.id],
        checklist: prev[step.id]?.checklist?.map((item, i) => i === index ? { ...item, checked: !item.checked } : item) ||
          step.checklist.map((text, i) => ({ text, checked: i === index }))
      }
    }));
  }, [step.id, setData]);

  const checklistItems = data[step.id]?.checklist || step.checklist.map(text => ({ text, checked: false }));

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm transition-opacity duration-300 border border-gray-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h2>
      <p className="text-gray-600 mb-3 text-sm">{step.description}</p>
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">Checklist :</p>
        {step.checklist.map((item, index) => (
          <label key={index} className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={checklistItems[index]?.checked || false}
              onChange={() => handleChecklistChange(index)}
              className="h-4 w-4 accent-blue-600 focus:ring-2 focus:ring-blue-600"
              aria-label={`Checklist ${item}`}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <textarea
        className={`w-full p-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:ring-2 focus:ring-blue-600 ${errors[step.id] ? 'border-red-500' : ''}`}
        rows="4"
        value={data[step.id]?.text || ''}
        onChange={handleTextChange}
        placeholder="Détaillez vos réponses ici..."
        aria-label={`Détails pour ${step.title}`}
      />
      {errors[step.id] && <p className="text-red-500 text-xs mt-1">{errors[step.id]}</p>}
    </div>
  );
});

export default StepForm;