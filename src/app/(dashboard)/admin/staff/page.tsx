'use client';

import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, KPICard } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { userAPI } from '@/lib/mock-api';
import { formatDate, formatRelative } from '@/lib/utils';
import type { User, UserRole } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    userAPI.list().then((r) => setStaff(r.data));
  }, []);

  const filtered = staff.filter((u) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  const roles: Array<{ value: 'all' | UserRole; label: string }> = [
    { value: 'all', label: 'All Staff' },
    { value: 'doctor', label: 'Doctors' },
    { value: 'nurse', label: 'Nurses' },
    { value: 'lab_technician', label: 'Lab Techs' },
    { value: 'pharmacist', label: 'Pharmacists' },
    { value: 'receptionist', label: 'Receptionists' },
    { value: 'hospital_admin', label: 'Admin' },
  ];

  const doctorCount = staff.filter((u) => u.role === 'doctor').length;
  const nurseCount = staff.filter((u) => u.role === 'nurse').length;
  const activeCount = staff.filter((u) => u.status === 'active').length;

  function roleVariant(role: UserRole) {
    switch (role) {
      case 'doctor': return 'accent';
      case 'nurse': return 'healthy';
      case 'lab_technician': return 'warning';
      case 'pharmacist': return 'borderline';
      case 'receptionist': return 'secondary';
      case 'hospital_admin': return 'critical';
      default: return 'secondary';
    }
  }

  function roleLabel(role: UserRole) {
    const map: Partial<Record<UserRole, string>> = {
      doctor: 'Doctor',
      nurse: 'Nurse',
      lab_technician: 'Lab Tech',
      pharmacist: 'Pharmacist',
      receptionist: 'Receptionist',
      hospital_admin: 'Admin',
    };
    return map[role] ?? role;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors & Staff"
        description="Manage hospital staff across all roles"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label="Total Staff" value={staff.length} icon={Users} accentColor="primary" />
        <KPICard label="Doctors" value={doctorCount} icon={Users} accentColor="accent" />
        <KPICard label="Active" value={activeCount} icon={Users} accentColor="healthy" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => setRoleFilter(r.value)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              roleFilter === r.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-secondary'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <SectionCard
        title="Staff Directory"
        description={`Showing ${filtered.length} of ${staff.length}`}
      >
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title="No staff found" description="Try adjusting your search or filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Specialty / Info</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Last Login</th>
                  <th className="px-3 py-3">2FA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.full_name} size="sm" />
                        <div>
                          <div className="font-medium">{u.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {u.phone.country_code} {u.phone.number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={roleVariant(u.role)}>{roleLabel(u.role)}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-3 py-3">
                      {u.doctor_profile ? (
                        <div>
                          <div className="text-sm font-medium">{u.doctor_profile.specialty}</div>
                          <div className="text-xs text-muted-foreground">
                            BMDC: {u.doctor_profile.bmdc_number} · {u.doctor_profile.years_of_experience}yr exp
                          </div>
                        </div>
                      ) : u.nurse_profile ? (
                        <div className="text-xs text-muted-foreground">
                          {u.nurse_profile.ward_assigned} · {u.nurse_profile.shift} shift
                        </div>
                      ) : u.lab_tech_profile ? (
                        <div className="text-xs text-muted-foreground">
                          {u.lab_tech_profile.specializations.join(', ')}
                        </div>
                      ) : u.pharmacist_profile ? (
                        <div className="text-xs text-muted-foreground">
                          Lic: {u.pharmacist_profile.license_number}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={u.status === 'active' ? 'healthy' : u.status === 'locked' ? 'critical' : 'secondary'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {u.last_login_at ? formatRelative(u.last_login_at) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={u.two_factor_enabled ? 'healthy' : 'secondary'}>
                        {u.two_factor_enabled ? 'On' : 'Off'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
