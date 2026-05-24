from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import random
import os

app = Flask(__name__)

db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Employee(db.Model):
    id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    avatar = db.Column(db.String(200), nullable=False)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate-profile', methods=['POST'])
def generate_profile():
    data = request.json
    name = data.get('name', 'John Doe')
    role = data.get('role', 'Team Member')
    department = data.get('department', 'General')
    bio = data.get('bio', 'No bio provided.')
    
    employee_id = f"EMP-{random.randint(1000, 9999)}"
    email = f"{name.lower().replace(' ', '.')}@company.com"
    avatar_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"

    new_employee = Employee(
        id=employee_id, name=name, role=role, 
        department=department, email=email, bio=bio, avatar=avatar_url
    )

    try:
        db.session.add(new_employee)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error or duplicate email"}), 400

    return jsonify({
        "id": employee_id, "name": name, "role": role,
        "department": department, "email": email, "bio": bio, "avatar": avatar_url
    })

# --- NEW ADMIN ROUTE ---
# This pulls every single employee row out of the database
@app.route('/api/profiles', methods=['GET'])
def get_all_profiles():
    employees = Employee.query.all()
    output = []
    for emp in employees:
        output.append({
            "id": emp.id,
            "name": emp.name,
            "role": emp.role,
            "department": emp.department,
            "email": emp.email,
            "bio": emp.bio,
            "avatar": emp.avatar
        })
    return jsonify(output)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
