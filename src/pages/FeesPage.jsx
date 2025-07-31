import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ChevronDown, X } from 'lucide-react';
import { supabase } from '../services/supabase';

// Reusable Components (same as before)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        {children}
    </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
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
        <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Main Application Components
const FeesPage = () => {
    const [activeTab, setActiveTab] = useState('paid');
    const [studentFees, setStudentFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch student fees with related data
                const { data: feesData, error: feesError } = await supabase
                    .from('student_fees')
                    .select('*');
                
                if (feesError) throw feesError;
                
                // Fetch students
                const { data: studentsData, error: studentsError } = await supabase
                    .from('students')
                    .select('id, fullname, class, gr_number');
                
                if (studentsError) throw studentsError;

                
                
                setStudentFees(feesData || []);
                setStudents(studentsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const getStudentDetails = (studentId) => students.find(s => s.id === studentId) || {};

    const paidStudents = studentFees.filter(sf => sf.status === 'paid').map(sf => ({ 
        ...sf, 
        student: getStudentDetails(sf.student_id),
        rollNumber: getStudentDetails(sf.student_id)?.roll_number || 'N/A'
    }));
    
    const unpaidStudents = studentFees.filter(sf => sf.status === 'pending').map(sf => ({ 
        ...sf, 
        student: getStudentDetails(sf.student_id),
        rollNumber: getStudentDetails(sf.student_id)?.gr_number || 'N/A'
    }));
    
    const defaulters = studentFees.filter(sf => sf.status === 'overdue').map(sf => ({ 
        ...sf, 
        student: getStudentDetails(sf.student_id),
        rollNumber: getStudentDetails(sf.student_id)?.roll_number || 'N/A'
    }));

    const tabs = [
        { id: 'paid', label: `Paid (${paidStudents.length})` },
        { id: 'unpaid', label: `Unpaid (${unpaidStudents.length})` },
        { id: 'defaulters', label: `Defaulters (${defaulters.length})` },
    ];

    const renderStudentList = (students) => {
        if (loading) {
            return <p className="text-center text-gray-500 py-8">Loading...</p>;
        }
        
        if (students.length === 0) {
            return <p className="text-center text-gray-500 py-8">No students in this category.</p>;
        }
        
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(({ id, student, final_amount, due_date, remarks, rollNumber }) => (
                            <tr key={id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{student?.fullname || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">Roll #: {rollNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.class || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">Rs. {final_amount?.toLocaleString() || '0'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{due_date ? new Date(due_date).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{remarks || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fee Status for {currentMonth}</h2>
            <p className="text-gray-600 mb-6">Overview of student fee payments.</p>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {activeTab === 'paid' && renderStudentList(paidStudents)}
                {activeTab === 'unpaid' && renderStudentList(unpaidStudents)}
                {activeTab === 'defaulters' && renderStudentList(defaulters)}
            </div>
        </Card>
    );
};

const FeeStructure = () => {
    const [classFees, setClassFees] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch class fees with fee types
                const { data: classFeesData, error: classFeesError } = await supabase
                    .from('class_fees')
                    .select('*');
                
                if (classFeesError) throw classFeesError;
                
                // Fetch fee types
                const { data: feeTypesData, error: feeTypesError } = await supabase
                    .from('fee_types')
                    .select('*');
                
                if (feeTypesError) throw feeTypesError;
                
                setClassFees(classFeesData || []);
                setFeeTypes(feeTypesData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const getFeeTypeName = (feeTypeId) => feeTypes.find(ft => ft.id === feeTypeId)?.name || 'Unknown';

    const openModalForNew = () => {
        setEditingFee(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (fee) => {
        setEditingFee(fee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFee(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fee structure?')) {
            try {
                const { error } = await supabase
                    .from('class_fees')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                setClassFees(prev => prev.filter(f => f.id !== id));
            } catch (error) {
                console.error('Error deleting fee structure:', error);
            }
        }
    };
    
    const FeeStructureForm = ({ fee, onSave, onCancel }) => {
        const [formData, setFormData] = useState(fee || {
            class: '',
            fee_type_id: '',
            amount: '',
            number_of_installments: 1
        });

        useEffect(() => {
            if (fee) {
                setFormData(fee);
            }
        }, [fee]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            try {
                if (formData.id) {
                    // Update existing record
                    const { data, error } = await supabase
                        .from('class_fees')
                        .update(formData)
                        .eq('id', formData.id)
                        .select();
                    
                    if (error) throw error;
                    
                    onSave(data[0]);
                } else {
                    // Create new record
                    const { data, error } = await supabase
                        .from('class_fees')
                        .insert([formData])
                        .select();
                    
                    if (error) throw error;
                    
                    onSave(data[0]);
                }
            } catch (error) {
                console.error('Error saving fee structure:', error);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Class" id="class" name="class" value={formData.class} onChange={handleChange} placeholder="e.g., 9th Grade" required />
                <div>
                    <label htmlFor="fee_type_id" className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                    <select id="fee_type_id" name="fee_type_id" value={formData.fee_type_id} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select a fee type</option>
                        {feeTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                    </select>
                </div>
                <Input label="Amount" id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="e.g., 5000" required />
                <Input label="Number of Installments" id="number_of_installments" name="number_of_installments" type="number" value={formData.number_of_installments} onChange={handleChange} required />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Fee</Button>
                </div>
            </form>
        );
    };

    const handleSave = (feeData) => {
        if (editingFee) {
            setClassFees(prev => prev.map(f => f.id === feeData.id ? feeData : f));
        } else {
            setClassFees(prev => [...prev, feeData]);
        }
        closeModal();
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Class Fee Structure</h2>
                    <p className="text-gray-600">Manage fees for different classes.</p>
                </div>
                <Button onClick={openModalForNew}>
                    <Plus size={18} className="mr-2" /> Add New Fee
                </Button>
            </div>
            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installments</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {classFees.map((fee) => (
                                <tr key={fee.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFeeTypeName(fee.fee_type_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {fee.amount?.toLocaleString() || '0'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fee.number_of_installments}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => openModalForEdit(fee)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(fee.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFee ? 'Edit Fee Structure' : 'Add New Fee Structure'}>
                <FeeStructureForm fee={editingFee} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </Card>
    );
};

const FeeFines = () => {
    const [fines, setFines] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFine, setEditingFine] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('fee_fines')
                    .select('*');
                
                if (error) throw error;
                
                setFines(data || []);
            } catch (error) {
                console.error('Error fetching fines:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const openModalForNew = () => {
        setEditingFine(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (fine) => {
        setEditingFine(fine);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFine(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fine?')) {
            try {
                const { error } = await supabase
                    .from('fee_fines')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                setFines(prev => prev.filter(f => f.id !== id));
            } catch (error) {
                console.error('Error deleting fine:', error);
            }
        }
    };

    const FineForm = ({ fine, onSave, onCancel }) => {
        const [formData, setFormData] = useState(fine || {
            name: '',
            amount: '',
            description: ''
        });

        useEffect(() => {
            if (fine) {
                setFormData(fine);
            }
        }, [fine]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            try {
                if (formData.id) {
                    // Update existing record
                    const { data, error } = await supabase
                        .from('fee_fines')
                        .update(formData)
                        .eq('id', formData.id)
                        .select();
                    
                    if (error) throw error;
                    
                    onSave(data[0]);
                } else {
                    // Create new record
                    const { data, error } = await supabase
                        .from('fee_fines')
                        .insert([formData])
                        .select();
                    
                    if (error) throw error;
                    
                    onSave(data[0]);
                }
            } catch (error) {
                console.error('Error saving fine:', error);
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Fine Name" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Late Fee" required />
                <Input label="Amount" id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="e.g., 500" required />
                <Input label="Description" id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe when this fine applies" />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="primary">Save Fine</Button>
                </div>
            </form>
        );
    };

    const handleSave = (fineData) => {
        if (editingFine) {
            setFines(prev => prev.map(f => f.id === fineData.id ? fineData : f));
        } else {
            setFines(prev => [...prev, fineData]);
        }
        closeModal();
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Fee Fines</h2>
                    <p className="text-gray-600">Manage various types of fines.</p>
                </div>
                <Button onClick={openModalForNew}>
                    <Plus size={18} className="mr-2" /> Add New Fine
                </Button>
            </div>
            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fines.map((fine) => (
                                <tr key={fine.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fine.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {fine.amount?.toLocaleString() || '0'}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-sm">{fine.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => openModalForEdit(fine)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(fine.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingFine ? 'Edit Fine' : 'Add New Fine'}>
                <FineForm fine={editingFine} onSave={handleSave} onCancel={closeModal} />
            </Modal>
        </Card>
    );
};

export default FeesPage;