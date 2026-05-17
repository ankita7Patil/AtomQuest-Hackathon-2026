from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor


OUT = "AtomQuest_GoalTrack_Submission.docx"


def set_cell(cell, text, bold=False):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    run = paragraph.add_run(text)
    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(10)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_heading(doc, text, level=1):
    paragraph = doc.add_heading(text, level=level)
    for run in paragraph.runs:
        run.font.name = "Arial"
        run.font.color.rgb = RGBColor(19, 33, 31)
    return paragraph


doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.8)
section.bottom_margin = Inches(0.8)
section.left_margin = Inches(0.85)
section.right_margin = Inches(0.85)

styles = doc.styles
styles["Normal"].font.name = "Arial"
styles["Normal"].font.size = Pt(10.5)

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("AtomQuest Hackathon 2026 Submission")
run.bold = True
run.font.name = "Arial"
run.font.size = Pt(21)
run.font.color.rgb = RGBColor(19, 33, 31)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("GoalTrack Portal - Goal Setting & Tracking Platform")
run.font.name = "Arial"
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(53, 103, 91)

add_heading(doc, "Project Snapshot", 1)
doc.add_paragraph(
    "GoalTrack Portal is a full-stack company goal management system built with React, Tailwind CSS, Node.js, Express, MongoDB Atlas, and JWT authentication. "
    "It supports employees, managers, and admins with validated goal plans, manager approval workflows, quarterly check-ins, planned vs actual tracking, shared goals, audit logs, and exportable reports."
)

table = doc.add_table(rows=5, cols=2)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = "Table Grid"
rows = [
    ("Working local link", "http://localhost:5173"),
    ("Backend health link", "http://localhost:5000/api/health"),
    ("Source repository", "Add your GitHub/GitLab/Bitbucket URL here"),
    ("Deployed frontend", "Add your Vercel/Netlify URL here"),
    ("Deployed backend", "Add your Render/Railway URL here"),
]
for row, (label, value) in zip(table.rows, rows):
    set_cell(row.cells[0], label, True)
    set_cell(row.cells[1], value)

add_heading(doc, "Demo Credentials", 1)
creds = doc.add_table(rows=4, cols=3)
creds.style = "Table Grid"
for i, text in enumerate(["Role", "Email", "Password"]):
    set_cell(creds.rows[0].cells[i], text, True)
for row, data in enumerate(
    [
        ("Employee", "employee@atomquest.demo", "Password@123"),
        ("Manager", "manager@atomquest.demo", "Password@123"),
        ("Admin", "admin@atomquest.demo", "Password@123"),
    ],
    start=1,
):
    for col, text in enumerate(data):
        set_cell(creds.rows[row].cells[col], text)

add_heading(doc, "Implemented Features", 1)
features = [
    "Login authentication using JWT",
    "Role-based dashboards for Employee, Manager, and Admin",
    "Goal creation, submission, approval, and rejection",
    "Validation rules: total weightage equals 100%, minimum goal weightage is 10%, maximum 8 goals",
    "Quarterly check-ins for Q1, Q2, Q3, and Q4",
    "Planned vs actual tracking with weighted progress calculation",
    "Status updates: Not Started, On Track, Completed",
    "Shared goals support",
    "Audit trail logging",
    "CSV/Excel-ready report export",
    "Responsive modern UI",
    "MongoDB Atlas schemas and deployment-ready REST API",
]
for item in features:
    doc.add_paragraph(item, style="List Bullet")

add_heading(doc, "Architecture Diagram", 1)
arch = doc.add_table(rows=5, cols=3)
arch.style = "Table Grid"
arch.alignment = WD_TABLE_ALIGNMENT.CENTER
diagram = [
    ("Users", "React Portal", "Express REST API"),
    ("Employee", "Role Dashboards", "JWT + RBAC"),
    ("Manager", "Goals + Check-ins", "Validation + Workflow"),
    ("Admin", "Reports + Audit UI", "Audit Logging"),
    ("", "CSV Export", "MongoDB Atlas"),
]
for r, row_data in enumerate(diagram):
    for c, text in enumerate(row_data):
        set_cell(arch.rows[r].cells[c], text, bold=(r == 0 or c == 0))

doc.add_paragraph("Flow: User -> React + Tailwind Portal -> Express REST API -> JWT Authentication -> Role Protection -> Goal/Check-in/Report Services -> MongoDB Atlas.")

add_heading(doc, "Deployment Plan", 1)
steps = [
    "Push this repository to GitHub, GitLab, or Bitbucket.",
    "Create a MongoDB Atlas cluster and copy the connection string.",
    "Deploy the server folder to Render or Railway with MONGODB_URI, JWT_SECRET, CLIENT_URL, and PORT.",
    "Deploy the client folder to Vercel or Netlify with VITE_API_URL pointing to the backend.",
    "Run npm run seed in the server deployment if sample data is needed.",
    "Replace the placeholder links in this document before final hackathon submission.",
]
for item in steps:
    doc.add_paragraph(item, style="List Number")

doc.save(OUT)
print(OUT)
