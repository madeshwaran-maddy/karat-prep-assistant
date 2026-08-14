export const reviewerData = {
  candidates: [
    {
      id: "john-doe",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "9999999999",
      startDate: "01-Jan-26",
      timeline: "12 Weeks",
      leadName: "Mahesh",
      status: "Active",
      round1Attempts: 8,
      round2Attempts: 3,
      attempts: [
        {
          id: "r1-a1",
          round: "Round 1" as const,
          attemptNo: "Attempt 1",
          attemptedDate: "05-Jan-26",
          fileName: "CustomerSolution.java",
          solution: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;

        return Objects.equals(
            customerId,
            customer.customerId
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId);
    }
}`
        },
        {
          id: "r1-a2",
          round: "Round 1" as const,
          attemptNo: "Attempt 2",
          attemptedDate: "08-Jan-26",
          fileName: "CustomerSolution.java",
          solution: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;

        return Objects.equals(
            customerId,
            customer.customerId
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId);
    }
}`
        },
        {
          id: "r1-a3",
          round: "Round 1" as const,
          attemptNo: "Attempt 3",
          attemptedDate: "15-Jan-26",
          fileName: "CustomerSolution.java",
          solution: `public class Customer {
    private String customerId;

    public String getCustomerId() {
        return customerId;
    }
}`
        },
        {
          id: "r2-a1",
          round: "Round 2" as const,
          attemptNo: "Attempt 1",
          attemptedDate: "20-Jan-26",
          fileName: "PaymentService.java",
          solution: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.isBlank();
    }
}`
        },
        {
          id: "r2-a2",
          round: "Round 2" as const,
          attemptNo: "Attempt 2",
          attemptedDate: "22-Jan-26",
          fileName: "PaymentService.java",
          solution: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.isBlank();
    }
}`
        }
      ]
    },
    {
      id: "john-smith",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "9888888888",
      startDate: "10-Feb-26",
      timeline: "10 Weeks",
      leadName: "Kiran",
      status: "Active",
      round1Attempts: 6,
      round2Attempts: 2,
      attempts: [
        {
          id: "r1-a1",
          round: "Round 1" as const,
          attemptNo: "Attempt 1",
          attemptedDate: "15-Feb-26",
          fileName: "OrderService.java",
          solution: `public class OrderService {
    public void createOrder() {
        // mock submission
    }
}`
        }
      ]
    },
    {
      id: "johnny-parker",
      name: "Johnny Parker",
      email: "johnny.parker@email.com",
      phone: "9777777777",
      startDate: "15-Mar-26",
      timeline: "8 Weeks",
      leadName: "Anita",
      status: "Active",
      round1Attempts: 4,
      round2Attempts: 1,
      attempts: [
        {
          id: "r1-a1",
          round: "Round 1" as const,
          attemptNo: "Attempt 1",
          attemptedDate: "18-Mar-26",
          fileName: "InventoryService.java",
          solution: `public class InventoryService {
    public int availableStock(int stock) {
        return Math.max(stock, 0);
    }
}`
        }
      ]
    }
  ]
};