import { useState, useEffect } from 'react';

// Default 15 official MITS Departments and 37 Branches mapping
const defaultRawPrograms = [
  // Centre for Artificial Intelligence
  { program: 'B.Tech', department: 'Centre for Artificial Intelligence', branchName: 'Artificial Intelligence (AI) and Data Science', branchCode: 'AD', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Artificial Intelligence', branchName: 'Artificial Intelligence and Machine Learning', branchCode: 'AM', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Artificial Intelligence', branchName: 'Artificial Intelligence(AI)', branchCode: 'AI', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Artificial Intelligence', branchName: 'IT (Artificial Intelligence and Robotics)', branchCode: 'IR', duration: '8 Sem' },

  // Centre for Computer Science and Technology
  { program: 'B.Tech', department: 'Centre for Computer Science and Technology', branchName: 'Computer Science and Business Systems', branchCode: 'CB', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Computer Science and Technology', branchName: 'Computer science and Technology', branchCode: 'CT', duration: '8 Sem' },

  // Centre for Internet of Things
  { program: 'B.Tech', department: 'Centre for Internet of Things', branchName: 'Electrical and Computer Engineering', branchCode: 'EC', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Internet of Things', branchName: 'Internet of Things', branchCode: 'EO', duration: '8 Sem' },
  { program: 'B.Tech', department: 'Centre for Internet of Things', branchName: 'Internet of Things (IoT)', branchCode: 'IO', duration: '8 Sem' },

  // Computer Science and Design
  { program: 'B.Tech', department: 'Computer Science and Design', branchName: 'Computer Science and Design', branchCode: 'CD', duration: '8 Sem' },

  // Electrical Engineering
  { program: 'PhD', department: 'Electrical Engineering', branchName: 'Electrical Engineering', branchCode: 'PDEE', duration: '8 Sem' },

  // School of Architecture
  { program: 'B.Arch', department: 'School of Architecture', branchName: 'Bachelor of Architecture', branchCode: 'AR', duration: '10 Sem' },
  { program: 'MUP', department: 'School of Architecture', branchName: 'Urban Planning', branchCode: 'MUP', duration: '4 Sem' },

  // School of Chemical Engineering
  { program: 'B.Tech', department: 'School of Chemical Engineering', branchName: 'Chemical Engineering', branchCode: 'CM', duration: '8 Sem' },

  // School of Civil Engineering
  { program: 'B.Tech', department: 'School of Civil Engineering', branchName: 'Civil Engineering', branchCode: 'CE', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Civil Engineering', branchName: 'Construction Technology & Management', branchCode: 'MTCTM', duration: '4 Sem' },
  { program: 'M.Tech', department: 'School of Civil Engineering', branchName: 'Environment Engineering', branchCode: 'EN', duration: '4 Sem' },
  { program: 'M.Tech', department: 'School of Civil Engineering', branchName: 'Structural Design', branchCode: 'MTSD', duration: '4 Sem' },

  // School of Computer Science & Engineering
  { program: 'PhD', department: 'School of Computer Science & Engineering', branchName: 'Computer Science & Engineering', branchCode: 'PDCE', duration: '8 Sem' },
  { program: 'B.Tech', department: 'School of Computer Science & Engineering', branchName: 'Computer Science and Engineering', branchCode: 'CS', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Computer Science & Engineering', branchName: 'Computer Science and Engineering', branchCode: 'MTCS', duration: '4 Sem' },

  // School of Electrical Engineering
  { program: 'B.Tech', department: 'School of Electrical Engineering', branchName: 'Electrical Engineering', branchCode: 'EE', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Electrical Engineering', branchName: 'Industrial Systems & Drives', branchCode: 'MTISD', duration: '4 Sem' },

  // School of Electronics and Communication Engineering
  { program: 'M.Tech', department: 'School of Electronics and Communication Engineering', branchName: 'Communication Control and Networking', branchCode: 'CN', duration: '4 Sem' },
  { program: 'B.Tech', department: 'School of Electronics and Communication Engineering', branchName: 'Electronics and Telecommunications', branchCode: 'ET', duration: '8 Sem' },
  { program: 'B.Tech', department: 'School of Electronics and Communication Engineering', branchName: 'Electronics Engineering', branchCode: 'EL', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Electronics and Communication Engineering', branchName: 'Microwave Engineering', branchCode: 'MTEC', duration: '4 Sem' },

  // School of Engineering Mathematics & Computing
  { program: 'PhD', department: 'School of Engineering Mathematics & Computing', branchName: 'Computer Application', branchCode: 'PDCA', duration: '8 Sem' },
  { program: 'MCA', department: 'School of Engineering Mathematics & Computing', branchName: 'Master of Computer Applications', branchCode: 'CA', duration: '4 Sem' },
  { program: 'B.Tech', department: 'School of Engineering Mathematics & Computing', branchName: 'Mathematics and Computing', branchCode: 'MC', duration: '8 Sem' },

  // School of Humanities and Management
  { program: 'MBA', department: 'School of Humanities and Management', branchName: 'Masters of Business Administration', branchCode: 'MBA', duration: '4 Sem' },

  // School of Information Technology
  { program: 'B.Tech', department: 'School of Information Technology', branchName: 'Information Technology', branchCode: 'IT', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Information Technology', branchName: 'Information Technology', branchCode: 'MTIT', duration: '4 Sem' },

  // School of Mechanical Engineering
  { program: 'B.Tech', department: 'School of Mechanical Engineering', branchName: 'AUTOMOBILE ENGINEERING', branchCode: 'AU', duration: '8 Sem' },
  { program: 'B.Tech', department: 'School of Mechanical Engineering', branchName: 'Mechanical Engineering', branchCode: 'ME', duration: '8 Sem' },
  { program: 'PhD', department: 'School of Mechanical Engineering', branchName: 'Mechanical Engineering', branchCode: 'PDME', duration: '8 Sem' },
  { program: 'M.Tech', department: 'School of Mechanical Engineering', branchName: 'Production Engineering', branchCode: 'PE', duration: '4 Sem' },
];

export const usePrograms = () => {
  const [programs, setPrograms] = useState(() => {
    try {
      const stored = localStorage.getItem('saathi_mits_academic_departments');
      if (stored) {
        const parsed = JSON.parse(stored);
        const flattened = [];
        parsed.forEach((dept) => {
          dept.branches?.forEach((b) => {
            flattened.push({
              program: b.degree,
              department: dept.deptName,
              branchName: b.name,
              branchCode: b.code,
              duration: b.duration,
            });
          });
        });
        if (flattened.length > 0) return flattened;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultRawPrograms;
  });

  return { programs };
};

export default usePrograms;
