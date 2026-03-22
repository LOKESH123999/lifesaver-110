import { Donor } from "../models";
import { Settings } from "../models";
import { CallLog } from "../models";
import { IBloodRequestDocument, IDonorDocument } from "../types";

interface MatchingConfig {
  minDaysBetweenDonations: number;
  maxCallsPerDonorPerMonth: number;
  maxDonorsToCallPerRequest: number;
}

// Load config from DB or use safe defaults
async function loadMatchingConfig(): Promise<MatchingConfig> {
  const settings = await Settings.findOne();
  if (!settings) {
    return {
      minDaysBetweenDonations: 90,
      maxCallsPerDonorPerMonth: 3,
      maxDonorsToCallPerRequest: 20,
    };
  }

  return {
    minDaysBetweenDonations: settings.minDaysBetweenDonations,
    maxCallsPerDonorPerMonth: settings.maxCallsPerDonorPerMonth,
    maxDonorsToCallPerRequest: settings.maxDonorsToCallPerRequest,
  };
}

export async function matchDonorsForRequest(
  request: IBloodRequestDocument,
): Promise<IDonorDocument[]> {
  try {
    const config = await loadMatchingConfig();

    // 1) Find candidate donors
    const candidates = await Donor.find({
      bloodGroup: request.bloodGroupRequired,
      city: request.city,
      isActive: true,
      isEligible: true,
      consentToCalls: true,
    });

    const now = new Date();
    const filtered: IDonorDocument[] = [];

    for (const donor of candidates) {
      // Check minimum days between donations
      if (donor.lastDonationDate) {
        const diffMs = now.getTime() - donor.lastDonationDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays < config.minDaysBetweenDonations) continue;
      }

      // Check max calls per donor per month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const callsCount = await CallLog.countDocuments({
        donorId: donor._id,
        createdAt: { $gte: monthAgo },
      });

      if (callsCount >= config.maxCallsPerDonorPerMonth) continue;

      filtered.push(donor);
    }

    // Sort donors: same area first, then by oldest donation date
    filtered.sort((a, b) => {
      if (a.area === request.area && b.area !== request.area) return -1;
      if (b.area === request.area && a.area !== request.area) return 1;

      const aDate = a.lastDonationDate ? a.lastDonationDate.getTime() : 0;
      const bDate = b.lastDonationDate ? b.lastDonationDate.getTime() : 0;
      return aDate - bDate; // older donation first
    });

    // Limit to max donors per request
    return filtered.slice(0, config.maxDonorsToCallPerRequest);
  } catch (error) {
    console.error("Error in matchDonorsForRequest:", error);
    return [];
  }
}
