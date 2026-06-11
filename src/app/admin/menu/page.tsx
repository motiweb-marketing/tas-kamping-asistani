import { redirect } from 'next/navigation';

export default function AdminMenuRedirect() {
  redirect('/admin/camp-settings');
}
