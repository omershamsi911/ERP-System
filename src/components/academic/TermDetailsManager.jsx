import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../services/supabase";

const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
  </div>
);

const Select = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select id={id} {...props} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      {children}
    </select>
  </div>
);


export const Calendar = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export const BookOpen = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const ClipboardList = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export const LayoutGrid = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
  </svg>
);

export const PlusCircle = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const Trash2 = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);


export default function TermDetailsManager() {
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [details, setDetails] = useState([]);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      // Fetch terms
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('id, name')
        .order('start_date', { ascending: true });
      
      if (termsError) console.error('Error fetching terms:', termsError);
      else setTerms(termsData || []);
      
      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (classesError) console.error('Error fetching classes:', classesError);
      else setClasses(classesData || []);
      
      if (termsData && termsData.length > 0) {
        setSelectedTermId(termsData[0].id);
      }
      if (classesData && classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
      
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  const fetchDetails = useCallback(async () => {
    if (!selectedTermId || !selectedClassId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('term_details')
        .select('*')
        .eq('term_id', selectedTermId)
        .eq('class_id', selectedClassId)
        .order('subject', { ascending: true });
      
      if (error) throw error;
      setDetails(data || []);
    } catch (error) {
      console.error('Error fetching term details:', error.message);
    }
    setIsLoading(false);
  }, [selectedTermId, selectedClassId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const detailData = {
      ...Object.fromEntries(formData.entries()),
      term_id: selectedTermId,
      class_id: selectedClassId,
      exam_weightage: Number(formData.get('exam_weightage'))
    };

    try {
      if (currentDetail && currentDetail.id) {
        const { error } = await supabase
          .from('term_details')
          .update(detailData)
          .eq('id', currentDetail.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('term_details')
          .insert([detailData]);
        
        if (error) throw error;
      }
      await fetchDetails();
      setCurrentDetail(null);
    } catch (error) {
      console.error('Error saving term detail:', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('term_details')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchDetails();
    } catch (error) {
      console.error('Error deleting term detail:', error.message);
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Select Term"
          id="term-select"
          value={selectedTermId}
          onChange={(e) => setSelectedTermId(e.target.value)}
        >
          {terms.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
        </Select>
        <Select
          label="Select Class"
          id="class-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-4">Subject Details for {classes.find(c => c.id === selectedClassId)?.name || 'Class'} - {terms.find(t => t.id === selectedTermId)?.name || 'Term'}</h2>
            <div className="space-y-3">
              {details.map(detail => (
                <div key={detail.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{detail.subject} ({detail.subject_id})</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Syllabus:</strong> {detail.syllabus_outline}</p>
                      <p className="text-sm text-gray-600"><strong>Exam Weightage:</strong> {detail.exam_weightage}%</p>
                      <p className="text-sm text-gray-500 mt-1"><em>{detail.remarks}</em></p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button onClick={() => setCurrentDetail(detail)} variant="secondary">Edit</Button>
                      <Button onClick={() => handleDelete(detail.id)} variant="danger"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <h2 className="text-xl font-bold mb-4">{currentDetail ? 'Edit Detail' : 'Add New Subject Detail'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Subject" id="subject" name="subject" type="text" defaultValue={currentDetail?.subject || ''} required />
              <Input label="Subject ID" id="subject_id" name="subject_id" type="text" defaultValue={currentDetail?.subject_id || ''} placeholder="e.g., MATH101" required />
              <Input label="Syllabus Outline" id="syllabus_outline" name="syllabus_outline" type="text" defaultValue={currentDetail?.syllabus_outline || ''} />
              <Input label="Exam Weightage (%)" id="exam_weightage" name="exam_weightage" type="number" defaultValue={currentDetail?.exam_weightage || ''} min="0" max="100" required />
              <Input label="Remarks" id="remarks" name="remarks" type="text" defaultValue={currentDetail?.remarks || ''} />
              <div className="flex justify-end space-x-3 pt-2">
                {currentDetail && <Button type="button" onClick={() => setCurrentDetail(null)} variant="secondary">Cancel</Button>}
                <Button type="submit" variant="primary">Save Detail</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}