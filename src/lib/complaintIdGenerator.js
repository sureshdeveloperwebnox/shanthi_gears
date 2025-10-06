import prisma from './prisma';

/**
 * Generates a custom complaint ID in format: SGL-YYYY-MM-DD-XXXX
 * Where SGL is static, YYYY-MM-DD is current date, and XXXX is auto-incremented
 */
export async function generateComplaintId() {
  try {
    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Create the date prefix
    const datePrefix = `${year}-${month}-${day}`;
    
    // Find the highest existing complaint ID with the same date prefix
    const existingComplaints = await prisma.complaints.findMany({
      where: {
        complaintId: {
          startsWith: `SGL-${datePrefix}-`
        }
      },
      select: {
        complaintId: true
      },
      orderBy: {
        complaintId: 'desc'
      }
    });
    
    // Extract the number part from the last complaint ID
    let nextNumber = 1;
    if (existingComplaints.length > 0) {
      const lastComplaintId = existingComplaints[0].complaintId;
      // Extract the number part after the last dash
      const parts = lastComplaintId.split('-');
      const lastNumber = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format the number with leading zeros (4 digits)
    const formattedNumber = String(nextNumber).padStart(4, '0');
    
    // Generate the final complaint ID
    const complaintId = `SGL-${datePrefix}-${formattedNumber}`;
    
    console.log(`Generated complaint ID: ${complaintId}`);
    return complaintId;
    
  } catch (error) {
    console.error('Error generating complaint ID:', error);
    // Fallback to UUID if there's an error
    const fallbackId = `SGL-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log(`Using fallback complaint ID: ${fallbackId}`);
    return fallbackId;
  }
}

/**
 * Validates if a complaint ID follows the correct format
 */
export function validateComplaintId(complaintId) {
  const pattern = /^SGL-\d{4}-\d{2}-\d{2}-\d{4}$/;
  return pattern.test(complaintId);
}

/**
 * Extracts date from complaint ID
 */
export function extractDateFromComplaintId(complaintId) {
  const match = complaintId.match(/^SGL-(\d{4}-\d{2}-\d{2})-\d{4}$/);
  return match ? match[1] : null;
}
