import axios from 'axios';

const getBaseUrl = () => {
    const stored = localStorage.getItem('API_URL');
    if (stored && stored.includes('8080')) return stored;
    return 'http://localhost:8080/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    return config;
});

export const submissionService = {
    getAll: () => api.get('/submissions'),
    getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
    getByStudent: (studentId) => api.get(`/submissions/student/${studentId}`),
    submit: (data) => api.post('/submissions', data),
    grade: (submissionId, data) => api.put(`/submissions/${submissionId}/grade`, data),
};

export const notificationService = {
    getAll: () => api.get('/notifications'),
    create: (data) => api.post('/notifications', data),
    delete: (id) => api.delete(`/notifications/${id}`),
};

export const resourceService = {
    getAll: () => api.get('/resources'),
    getBySection: (sectionId) => api.get(`/resources/section/${sectionId}`),
    getByTeacher: (teacherId) => api.get(`/resources/teacher/${teacherId}`),
    create: (data) => api.post('/resources', data),
    delete: (id) => api.delete(`/resources/${id}`),
};

export const noteService = {
    getBySection: (sectionId) => api.get(`/notes/section/${sectionId}`),
    create: (data) => api.post('/notes', data),
};

export const queryService = {
    getAll: () => api.get('/queries'),
    getBySender: (senderId) => api.get(`/queries/sender/${senderId}`),
    getAdminQueries: () => api.get('/queries/admin'),
    create: (data) => api.post('/queries', data),
    resolve: (id, replyData) => api.put(`/queries/${id}/resolve`, replyData),
};

export const assignmentService = {
    getBySection: (sectionId) => api.get(`/assignments/section/${sectionId}`),
    getByTeacher: (teacherId) => api.get(`/assignments/teacher/${teacherId}`),
    create: (data) => api.post('/assignments', data),
    delete: (id) => api.delete(`/assignments/${id}`),
};

export const studentService = {
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    remove: (id) => api.delete(`/students/${id}`),
};

export const teacherService = {
    getAll: () => api.get('/teachers'),
    getById: (id) => api.get(`/teachers/${id}`),
    create: (data) => api.post('/teachers', data),
    update: (id, data) => api.put(`/teachers/${id}`, data),
    remove: (id) => api.delete(`/teachers/${id}`),
};

export const sectionService = {
    getAll: () => api.get('/sections'),
    create: (data) => api.post('/sections', data),
    delete: (id) => api.delete(`/sections/${id}`),
    getById: (id) => api.get(`/sections/${id}`),
};

export const attendanceService = {
    getAll: () => api.get('/attendance'),
    markRfid: (rfidUid, subject, status) =>
        api.post(`/attendance/mark-rfid?rfidUid=${rfidUid}&subject=${subject}&status=${status}`),
    markManual: (data) => api.post('/attendance/mark-manual', data),
    adminUpdate: (data) => api.post('/attendance/admin-update', data),
    getPercentage: (rfidUid, subject) =>
        api.get(`/attendance/percentage?rfidUid=${rfidUid}&subject=${subject}`),
};

export const gradeService = {
    getAll: () => api.get('/grades'),
    getByRfidOrId: (id) => api.get(`/grades/${id}`),
    add: (rfidUid, studentId, data) => {
        const params = new URLSearchParams();
        if (rfidUid) params.append('rfidUid', rfidUid);
        if (studentId) params.append('studentId', studentId);
        return api.post(`/grades?${params.toString()}`, data);
    },
    update: (id, data) => api.put(`/grades/${id}`, data),
    delete: (id) => api.delete(`/grades/${id}`),
    calculateGPA: (id) => api.get(`/grades/gpa/${id}`),
};

export const libraryService = {
    getAllBooks: () => api.get('/library/books'),
    getAllIssues: () => api.get('/library/issues'),
    getByStudent: (studentId) => api.get(`/library/issues/student/${studentId}`),
    addBook: (data) => api.post('/library/books', data),
    issueBook: (data) => api.post('/library/issue', data),
    returnBook: (issueId) => api.post(`/library/return/${issueId}`),
    updateBook: (id, data) => api.put(`/library/books/${id}`, data),
    deleteBook: (id) => api.delete(`/library/books/${id}`),
    deleteIssue: (id) => api.delete(`/library/issues/${id}`),
};

export const feeService = {
    getAll: () => api.get('/fees'),
    getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
    create: (data) => api.post('/fees', data),
    update: (id, data) => api.put(`/fees/${id}`, data),
    delete: (id) => api.delete(`/fees/${id}`),
};

export const placementService = {
    getAll: () => api.get('/placements'),
    getLatest: () => api.get('/placements/latest'),
    getDrives: () => api.get('/placements/drives'),
    add: (data) => api.post('/placements', data),
    addDrive: (data) => api.post('/placements/drives', data),
    deleteDrive: (id) => api.delete(`/placements/drives/${id}`),
};

export const dashboardService = {
    getStudentData: (identifier) => api.get(`/dashboard/student?identifier=${identifier}`),
    getBooks: () => api.get('/library/books'),
};

export const timetableService = {
    getAll: () => api.get('/timetable'),
    getBySection: (sectionId) => api.get(`/timetable/section/${sectionId}`),
    getByTeacher: (teacherId) => api.get(`/timetable/teacher/${teacherId}`),
    getTodayByRole: (role, identifier) => api.get(`/timetable/today?role=${role}&identifier=${identifier}`),
    createSlot: (data) => api.post('/timetable', data),
    updateSlot: (id, data) => api.put(`/timetable/${id}`, data),
    deleteSlot: (id) => api.delete(`/timetable/${id}`),
};

export default api;
