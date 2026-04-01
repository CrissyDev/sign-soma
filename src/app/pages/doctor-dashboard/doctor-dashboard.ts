import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Appointment {
  name: string;
  issue: string;
  time: string;
  status: 'active' | 'waiting' | 'completed';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.html',
  styleUrls: ['./doctor-dashboard.css']
})
export class DoctorDashboard {

  constructor(private router: Router) {}

  stats = {
    active: 1,
    waiting: 1,
    completed: 1,
    total: 3
  };

  appointments: Appointment[] = [
    { name: 'John Smith', issue: 'Headache & dizziness', time: '10:30 AM', status: 'active' },
    { name: 'Sarah Johnson', issue: 'Shoulder pain', time: '11:00 AM', status: 'waiting' },
    { name: 'Michael Brown', issue: 'Back pain', time: '09:00 AM', status: 'completed' }
  ];

  goToConsultation(appt: Appointment) {
    this.router.navigate(['/consultation'], {
      queryParams: {
        patient: appt.name,
        status: appt.status,
        issue: appt.issue,
        time: appt.time
      }
    });
  }
}