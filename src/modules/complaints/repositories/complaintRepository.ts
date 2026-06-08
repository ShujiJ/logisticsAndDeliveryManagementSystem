import Complaint from "../models/complaintModel";
import Shipment from "../../shipment/models/shipmentModel";
import User from "../../auth/models/userModel";
import DeliveryAgent from "../../deliveryAgent/models/deliveryAgentModel";
import { CreateComplaintDto } from "../dto/complaintDto";

class ComplaintRepository {
  // create a complaint
  async createComplaint(payload: CreateComplaintDto) {
    return await Complaint.create(payload);
  }
  //find complaint by id
  async findComplaintById(complaintId: number) {
    return await Complaint.findOne({ where: { id: complaintId } });
  }
  //get all complaints
  async findAllComplaints(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const whereClause: any = {}; //creates an empty object

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Shipment,
          as: "shipment",
          attributes: ["id", "trackingId", "customerId", "deliveryAgentId"],
          include: [
            {
              model: User,
              as: "customer",
              attributes: ["id", "name", "email"],
            },
            {
              model: DeliveryAgent,
              as: "deliveryAgent",
              attributes: ["id", "phoneNumber", "vehicleType", "serviceZone"],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["name", "email"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return { count, rows };
  }
}

export default new ComplaintRepository();
