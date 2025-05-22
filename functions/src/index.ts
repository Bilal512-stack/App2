import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

interface AssignData {
  orderId: string;
  transporterId: string;
}

export const assignOrder = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    // Vérifier que context existe et que l'utilisateur est admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Seuls les administrateurs peuvent assigner une commande."
      );
    }

    const { orderId, transporterId } = data as AssignData;

    if (!orderId || !transporterId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "orderId et transporterId sont requis."
      );
    }

    await admin.firestore().collection("Orders").doc(orderId).update({
      transporterId,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminId: context.auth.uid,
    });

    return { success: true, message: "Commande assignée avec succès." };
  }
);
