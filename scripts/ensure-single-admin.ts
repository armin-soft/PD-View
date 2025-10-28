import { db } from '../server/db';
import { users, activityLogs } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function ensureSingleAdmin() {
  
   
  const allAdmins = await db.select().from(users).where(eq(users.role, 'admin'));
  
  
  if (allAdmins.length === 0) {
    return;
  }
  
   
  allAdmins.forEach((admin, index) => {
    const fullName = `${admin.firstName} ${admin.lastName}`;
  });
  
   
  const targetAdmin = allAdmins.find(admin => {
    const fullName = `${admin.firstName} ${admin.lastName}`;
    return fullName.includes('امیر') && 
           fullName.includes('حسین') && 
           fullName.includes('نظری');
  });
  
  if (!targetAdmin) {
    allAdmins.forEach((admin, index) => {
      const fullName = `${admin.firstName} ${admin.lastName}`;
    });
    return;
  }
  
  const targetFullName = `${targetAdmin.firstName} ${targetAdmin.lastName}`;
  
   
  const adminsToDowngrade = allAdmins.filter(admin => admin.id !== targetAdmin.id);
  
  if (adminsToDowngrade.length === 0) {
    return;
  }
  
  
  for (const admin of adminsToDowngrade) {
    const adminFullName = `${admin.firstName} ${admin.lastName}`;
    
     
    await db.update(users)
      .set({ role: 'user' })
      .where(eq(users.id, admin.id));
    
     
    await db.insert(activityLogs).values({
      userId: targetAdmin.id,
      action: 'role_change',
      entity: 'user',
      entityId: admin.id,
      details: `نقش ${adminFullName} از admin به user تغییر یافت - اجرای سیاست تک مدیر`,
      ipAddress: '127.0.0.1'
    });
    
  }
  
}

ensureSingleAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
