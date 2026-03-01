package com.smartclass.dashboard;

import com.smartclass.dashboard.entity.*;
import com.smartclass.dashboard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * DataSeeder — runs automatically on every Spring Boot startup.
 * Seeds base data (sections, students, teachers, users) ONLY if
 * each collection is empty. Safe to run repeatedly — no duplicates.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    @Autowired private SectionRepository sectionRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private TeacherRepository teacherRepo;
    @Autowired private UserRepository userRepo;

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("🌱 DataSeeder: Checking if seed data is needed...");

        seedSections();
        seedTeachers();
        seedStudents();
        seedUsers();

        System.out.println("✅ DataSeeder: All collections verified.");
    }

    private void seedSections() {
        if (sectionRepo.count() > 0) {
            System.out.println("  ℹ️  Sections already exist (" + sectionRepo.count() + "). Skipping.");
            return;
        }
        System.out.println("  🔧 Seeding sections...");
        List<Section> sections = List.of(
            makeSection("CSE-A", "CSE", "4", "7", "2025-26", "A-101", 60),
            makeSection("CSE-B", "CSE", "4", "7", "2025-26", "A-102", 60),
            makeSection("ECE-A", "ECE", "3", "5", "2025-26", "B-201", 60),
            makeSection("ME-A",  "ME",  "2", "3", "2025-26", "C-301", 60)
        );
        sectionRepo.saveAll(sections);
        System.out.println("  ✅ " + sections.size() + " sections seeded.");
    }

    private void seedTeachers() {
        if (teacherRepo.count() > 0) {
            System.out.println("  ℹ️  Teachers already exist (" + teacherRepo.count() + "). Skipping.");
            return;
        }
        System.out.println("  🔧 Seeding teachers...");
        List<Teacher> teachers = List.of(
            makeTeacher("Dr. Isaac Clarke",   "T001", "isaac@avanthi.edu",  "CSE", "Professor",           "2020-01-15", "Ph.D in Computer Science", "123456"),
            makeTeacher("Dr. Sarah Connor",   "T002", "sarah@avanthi.edu",  "ECE", "Assistant Professor",  "2021-08-20", "M.Tech in Electronics",    "password123"),
            makeTeacher("Dr. Gordon Freeman", "T003", "gordon@avanthi.edu", "ME",  "Senior Professor",     "1998-05-10", "Ph.D in Physics",          "password123")
        );
        teacherRepo.saveAll(teachers);
        System.out.println("  ✅ " + teachers.size() + " teachers seeded.");
    }

    private void seedStudents() {
        if (studentRepo.count() > 0) {
            System.out.println("  ℹ️  Students already exist (" + studentRepo.count() + "). Skipping.");
            return;
        }
        System.out.println("  🔧 Seeding students...");

        // Fetch section IDs for proper linking
        Optional<Section> csea = sectionRepo.findAll().stream().filter(s -> "CSE-A".equals(s.getName())).findFirst();
        Optional<Section> cseb = sectionRepo.findAll().stream().filter(s -> "CSE-B".equals(s.getName())).findFirst();
        Optional<Section> ecea = sectionRepo.findAll().stream().filter(s -> "ECE-A".equals(s.getName())).findFirst();
        Optional<Section> mea  = sectionRepo.findAll().stream().filter(s -> "ME-A".equals(s.getName())).findFirst();

        String cseaId = csea.map(Section::getId).orElse(null);
        String csebId = cseb.map(Section::getId).orElse(null);
        String eceaId = ecea.map(Section::getId).orElse(null);
        String meaId  = mea.map(Section::getId).orElse(null);

        List<Student> students = List.of(
            makeStudent("Lara Croft",     "S002", "RFID002", "CSE", 4, "lara@avanthi.edu",    cseaId, "CSE-A", 2022, 2026, 9.8,  "123456"),
            makeStudent("Nathan Drake",   "S003", "RFID003", "CSE", 4, "nathan@avanthi.edu",  cseaId, "CSE-A", 2022, 2026, 9.2,  "password123"),
            makeStudent("Aloy Sobeck",    "S004", "RFID004", "CSE", 4, "aloy@avanthi.edu",    cseaId, "CSE-A", 2022, 2026, 9.5,  "password123"),
            makeStudent("Joel Miller",    "S005", "RFID005", "CSE", 4, "joel@avanthi.edu",    cseaId, "CSE-A", 2022, 2026, 8.8,  "password123"),
            makeStudent("Ellie Williams", "S006", "RFID006", "CSE", 4, "ellie@avanthi.edu",   csebId, "CSE-A", 2022, 2026, 9.7,  "password123"),
            makeStudent("Kratos Spartan", "S007", "RFID007", "CSE", 4, "kratos@avanthi.edu",  csebId, "CSE-B", 2022, 2026, 8.5,  "password123"),
            makeStudent("Arthur Morgan",  "S008", "RFID008", "CSE", 4, "arthur@avanthi.edu",  csebId, "CSE-B", 2022, 2026, 8.2,  "password123"),
            makeStudent("John Marston",   "S009", "RFID009", "CSE", 4, "john@avanthi.edu",    csebId, "CSE-B", 2022, 2026, 8.0,  "password123"),
            makeStudent("Master Chief",   "S010", "RFID010", "ECE", 3, "chief@avanthi.edu",   eceaId, "ECE-A", 2023, 2027, 9.4,  "password123"),
            makeStudent("Geralt Rivia",   "S011", "RFID011", "ME",  2, "geralt@avanthi.edu",  meaId,  "ME-A",  2024, 2028, 8.9,  "password123"),
            makeStudent("Ciri Princess",  "S012", "RFID012", "ME",  2, "ciri@avanthi.edu",    meaId,  "ME-A",  2024, 2028, 9.1,  "password123"),
            makeStudent("Isaac Newton",   "S013", "RFID013", "CSE", 4, "inewton@avanthi.edu", cseaId, "CSE-A", 2022, 2026, 9.6,  "password123"),
            makeStudent("Ada Lovelace",   "S014", "RFID014", "CSE", 4, "ada@avanthi.edu",     cseaId, "CSE-A", 2022, 2026, 9.9,  "password123"),
            makeStudent("Alan Turing",    "S015", "RFID015", "ECE", 3, "turing@avanthi.edu",  eceaId, "ECE-A", 2023, 2027, 9.3,  "password123"),
            makeStudent("Marie Curie",    "S016", "RFID016", "ME",  2, "mcurie@avanthi.edu",  meaId,  "ME-A",  2024, 2028, 8.7,  "password123")
        );
        studentRepo.saveAll(students);
        System.out.println("  ✅ " + students.size() + " students seeded.");
    }

    private void seedUsers() {
        System.out.println("  🔧 Seeding user login accounts...");
        int created = 0;

        // Teacher users
        for (Teacher t : teacherRepo.findAll()) {
            if (t.getEmail() != null && userRepo.findByEmail(t.getEmail()).isEmpty()) {
                String uname = t.getEmployeeId() != null ? t.getEmployeeId() : t.getEmail();
                userRepo.save(new User(uname, t.getEmail(), t.getPassword() != null ? t.getPassword() : "password123", "TEACHER"));
                created++;
            }
        }
        // Student users
        for (Student s : studentRepo.findAll()) {
            if (s.getEmail() != null && userRepo.findByEmail(s.getEmail()).isEmpty()) {
                String uname = s.getRollNo() != null ? s.getRollNo() : s.getEmail();
                userRepo.save(new User(uname, s.getEmail(), s.getPassword() != null ? s.getPassword() : "password123", "STUDENT"));
                created++;
            }
        }

        if (created > 0)
            System.out.println("  ✅ " + created + " user accounts created.");
        
        // Manual Admin
        if (userRepo.findByUsername("admin").isEmpty()) {
            userRepo.save(new User("admin", "admin@avanthi.edu", "admin", "ADMIN"));
            System.out.println("  ✅ Admin user seeded.");
        } else {
            System.out.println("  ℹ️  Admin user already exists. Skipping.");
        }
    }

    // ── Builders ────────────────────────────────────────────────

    private Section makeSection(String name, String branch, String year, String sem, String ay, String room, int cap) {
        Section s = new Section();
        s.setName(name); s.setBranch(branch); s.setYear(year);
        s.setSemester(sem); s.setAcademicYear(ay); s.setClassRoom(room); s.setMaxCapacity(cap);
        return s;
    }

    private Teacher makeTeacher(String name, String empId, String email, String dept, String desig, String joinDate, String qual, String pass) {
        Teacher t = new Teacher();
        t.setName(name); t.setEmployeeId(empId); t.setEmail(email);
        t.setDepartment(dept); t.setDesignation(desig);
        t.setJoiningDate(joinDate); t.setQualification(qual); t.setPassword(pass);
        return t;
    }

    private Student makeStudent(String name, String rollNo, String rfid, String branch, int year,
                                String email, String sectionId, String sectionName,
                                int joiningYear, int passingYear, double cgpa, String pass) {
        Student s = new Student();
        s.setName(name); s.setRollNo(rollNo); s.setRfidUid(rfid);
        s.setBranch(branch); s.setYear(year); s.setEmail(email);
        s.setSectionId(sectionId); s.setSectionName(sectionName);
        s.setJoiningYear(joiningYear); s.setPassingYear(passingYear);
        s.setCgpa(cgpa); s.setPassword(pass);
        return s;
    }
}
