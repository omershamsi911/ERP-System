import { useState, useEffect, useCallback, useMemo } from "react";
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

export default function ClassTimetableManager() {
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [teachers, setTeachers] = useState([]);


  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const fetchClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setClasses(data || []);
      
      if (data && data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    }
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setSections(data || []);
      
      if (data && data.length > 0) {
        setSelectedSection(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching sections:', error.message);
    }
  }, []);

  const fetchTimetable = useCallback(async () => {
    if (!selectedClass || !selectedSection) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_timetables')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('section_id', selectedSection)
        .order('day_of_the_week')
        .order('period');
      
      if (error) throw error;
      setTimetable(data || []);
    } catch (error) {
      console.error('Error fetching timetable:', error.message);
    }
    setIsLoading(false);
  }, [selectedClass, selectedSection]);


  const fetchTeachers = useCallback(async () => {
    try {
      // Step 1: Get role IDs for teacher roles
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .in('name', ['Class Teacher', 'Subject Teacher']);

      if (roleError) throw roleError;
      const roleIds = roleData.map(role => role.id);

      // Step 2: Get user IDs from user_roles
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role_id', roleIds);

      if (userRoleError) throw userRoleError;
      const userIds = userRoleData.map(ur => ur.user_id);

      // Step 3: Get user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      if (userError) throw userError;
      setTeachers(userData || []);
    } catch (error) {
      console.error('Error fetching teachers:', error.message);
    }
  }, []);


  useEffect(() => {
    fetchClasses();
    fetchSections();
    fetchTeachers();
  }, [fetchClasses, fetchTeachers, fetchSections]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entryData = {
      ...Object.fromEntries(formData.entries()),
      class_id: selectedClass,
      section_id: selectedSection,
      period: Number(formData.get('period'))
    };

    try {
      if (currentEntry && currentEntry.id) {
        const { error } = await supabase
          .from('class_timetables')
          .update(entryData)
          .eq('id', currentEntry.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('class_timetables')
          .insert([entryData]);
        
        if (error) throw error;
      }
      await fetchTimetable();
      setIsEditing(false);
      setCurrentEntry(null);
    } catch (error) {
      console.error('Error saving timetable entry:', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('class_timetables')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchTimetable();
    } catch (error) {
      console.error('Error deleting timetable entry:', error.message);
    }
  };
  
  const teacherMap = useMemo(() => {
    const map = {};
    teachers.forEach(teacher => {
      map[teacher.id] = teacher.full_name;
    });
    return map;
  }, [teachers]);

  const getEntry = (day, period) => {
    return timetable.find(e => e.day_of_the_week === day && e.period === period);
  };

  if (isLoading) return <div className="text-center p-8">Loading timetable...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Class Timetable</h2>
        <Button onClick={() => { setIsEditing(true); setCurrentEntry(null); }}>
          <PlusCircle className="w-5 h-5 mr-2 inline" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select 
          label="Select Class" 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </Select>
        <Select 
          label="Select Section" 
          value={selectedSection} 
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          {sections.map(sec => (
            <option key={sec.id} value={sec.id}>{sec.name}</option>
          ))}
        </Select>
      </div>

      {isEditing && (
        <Card className="mb-8">
          <h3 className="text-xl font-bold mb-4">
            {currentEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
            <span className="block text-sm font-normal text-gray-600">
              For {classes.find(c => c.id === selectedClass)?.name || 'Class'} - {sections.find(s => s.id === selectedSection)?.name || 'Section'}
            </span>
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Select label="Day of Week" name="day_of_the_week" defaultValue={currentEntry?.day_of_the_week || ''} required>
              {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
            </Select>
            <Input label="Period" name="period" type="number" defaultValue={currentEntry?.period || ''} min="1" max="8" required />
            <Input label="Subject" name="subject" defaultValue={currentEntry?.subject || ''} required />
            <Select 
              label="Teacher" 
              name="teacher_id" 
              defaultValue={currentEntry?.teacher_id || ''}
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </Select>
            <Input label="Start Time" name="start_time" type="time" defaultValue={currentEntry?.start_time || ''} required />
            <Input label="End Time" name="end_time" type="time" defaultValue={currentEntry?.end_time || ''} required />
            <Input label="Room" name="room" defaultValue={currentEntry?.room || ''} />
            <div className="col-span-full flex justify-end space-x-3 pt-2">
              <Button type="button" onClick={() => setIsEditing(false)} variant="secondary">Cancel</Button>
              <Button type="submit" variant="primary">Save Entry</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-bold">
            Timetable for {classes.find(c => c.id === selectedClass)?.name || 'Class'} - {sections.find(s => s.id === selectedSection)?.name || 'Section'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Day/Period</th>
                {periods.map(p => <th key={p} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Period {p}</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {daysOfWeek.map(day => (
                <tr key={day}>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-gray-900 border-r bg-gray-50">{day}</td>
                  {periods.map(period => {
                  const entry = getEntry(day, period);
                  return (
                    <td key={`${day}-${period}`} className="...">
                      {entry ? (
                        <div>
                          <p className="font-bold">{entry.subject}</p>
                          {/* CHANGE teacher_id display to teacher name */}
                          <p className="text-xs text-gray-600">
                            {teacherMap[entry.teacher_id] || entry.teacher_id}
                          </p>
                          {/* ... (rest of entry display remains) ... */}
                        </div>
                      ) : <div className="...">Empty</div>}
                    </td>
                  );
                })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}