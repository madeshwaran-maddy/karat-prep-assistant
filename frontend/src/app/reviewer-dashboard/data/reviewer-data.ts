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
}`,
          questions: [
            {
              id: "r1-a1-q1",
              questionNo: 1,
              topic: "Object Equality",
              subtopic: "equals() and hashCode()",
              questionCode: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;

        return Objects.equals(customerId, customer.customerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId);
    }
}`,
              userCode: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;
        return customerId.equals(customer.customerId);
    }

    @Override
    public int hashCode() {
        return customerId.hashCode();
    }
}`,
              userAnalysis: "I implemented equality and hashing with direct field comparison. This makes the objects comparable and keeps the value-based semantics for the customer ID.",
              score: 88,
              explanation: "The logic is mostly correct, but the candidate should guard against null customerId values before calling equals() and hashCode().",
              suggestions: [
                "Use Objects.equals(customerId, customer.customerId) instead of customerId.equals(...) to handle null safely.",
                "Keep the equals/hashCode contract aligned so equal objects produce the same hash value."
              ]
            },
            {
              id: "r1-a1-q2",
              questionNo: 2,
              topic: "Class Design",
              subtopic: "Constructor Design",
              questionCode: `public class Customer {
    private final String customerId;

    public Customer(String customerId) {
        this.customerId = customerId;
    }
}`,
              userCode: `public class Customer {
    private String customerId;

    public Customer(String customerId) {
        this.customerId = customerId;
    }
}`,
              userAnalysis: "The constructor accepts the ID and stores it. This keeps the object properly initialized for hashing and comparison.",
              score: 92,
              explanation: "The answer is strong and keeps the object state clear. Making the field final would make immutability more explicit but is not strictly required.",
              suggestions: [
                "Consider marking the field final if it should not change after construction.",
                "Document whether the object is expected to be immutable or mutable."
              ]
            }
          ]
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
}`,
          questions: [
            {
              id: "r1-a2-q1",
              questionNo: 1,
              topic: "Object Equality",
              subtopic: "equals() and hashCode()",
              questionCode: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;
        return Objects.equals(customerId, customer.customerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId);
    }
}`,
              userCode: `public class Customer {
    private String customerId;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Customer)) return false;

        Customer customer = (Customer) obj;
        return customerId.equals(customer.customerId);
    }

    @Override
    public int hashCode() {
        return customerId.hashCode();
    }
}`,
              userAnalysis: "I checked instance type and compared the customer IDs. The implementation aligns with a value-based comparison model.",
              score: 84,
              explanation: "The candidate correctly determined the comparison strategy but still needs a null-safe implementation to match Java best practices.",
              suggestions: [
                "Switch to Objects.equals to avoid NullPointerException.",
                "Use Objects.hash(customerId) to keep the hash consistent and readable."
              ]
            }
          ]
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
}`,
          questions: [
            {
              id: "r1-a3-q1",
              questionNo: 1,
              topic: "Encapsulation",
              subtopic: "Getter Method",
              questionCode: `public class Customer {
    private String customerId;

    public String getCustomerId() {
        return customerId;
    }
}`,
              userCode: `public class Customer {
    private String customerId;

    public String getCustomerId() {
        return customerId;
    }
}`,
              userAnalysis: "The getter returns the internal customer ID and preserves encapsulation while allowing read access to the field.",
              score: 96,
              explanation: "This is a correct and concise solution. It demonstrates proper encapsulation and a simple access method.",
              suggestions: [
                "Continue using accessors for controlled read access.",
                "Add validation if the ID should only be set under certain constraints."
              ]
            }
          ]
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
}`,
          questions: [
            {
              id: "r2-a1-q1",
              questionNo: 1,
              topic: "Null Checks",
              subtopic: "Input Validation",
              questionCode: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.isBlank();
    }
}`,
              userCode: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.trim().isEmpty();
    }
}`,
              userAnalysis: "I validated both a non-null value and a non-empty formatted ID before processing the payment request.",
              score: 90,
              explanation: "The solution properly validates the input, though trimming the ID could be made explicit to avoid whitespace-only strings.",
              suggestions: [
                "Use isBlank() for a clearer whitespace check in Java 11+.",
                "Keep validation consistent with any existing business rules for payment IDs."
              ]
            }
          ]
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
}`,
          questions: [
            {
              id: "r2-a2-q1",
              questionNo: 1,
              topic: "Null Checks",
              subtopic: "Input Validation",
              questionCode: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.isBlank();
    }
}`,
              userCode: `public class PaymentService {
    public boolean processPayment(String id) {
        return id != null && !id.isBlank();
    }
}`,
              userAnalysis: "The candidate checked for an empty or null value before proceeding, which is the correct validation behavior for this method.",
              score: 100,
              explanation: "This is a correct and clean validation pattern. It handles both null and blank ID values appropriately.",
              suggestions: [
                "Consider validating the ID format if business rules require it.",
                "Ensure the method name and error handling align with the surrounding payment workflow."
              ]
            }
          ]
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