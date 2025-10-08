import java.sql.*;
import java.util.Scanner;
import java.util.Properties;
import java.io.FileInputStream;
import java.io.IOException;

public class BankApp {

    private static Connection getConnection() throws SQLException, IOException {
        Properties props = new Properties();
        try (FileInputStream fis = new FileInputStream("resources/db.properties")) {
            props.load(fis);
        }
        Connection conn = DriverManager.getConnection(
                props.getProperty("url"),
                props.getProperty("username"),
                props.getProperty("password")
        );
        conn.setAutoCommit(true); // simpler: auto-commit
        return conn;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        boolean exit = false;

        while (!exit) {
            System.out.println("\n--- Banking Menu ---");
            System.out.println("1. Create Account");
            System.out.println("2. Deposit");
            System.out.println("3. Withdraw");
            System.out.println("4. Transfer");
            System.out.println("5. Show Balance");
            System.out.println("6. Exit");
            System.out.print("Choose: ");
            int choice = sc.nextInt();

            try (Connection conn = getConnection()) {
                switch (choice) {
                    case 1:
                        System.out.print("Enter name: ");
                        String name = sc.next();
                        System.out.print("Enter initial deposit: ");
                        double deposit = sc.nextDouble();
                        if (deposit < 0) { System.out.println("Cannot deposit negative!"); break; }
                        try (PreparedStatement ps = conn.prepareStatement(
                                "INSERT INTO accounts(name,balance) VALUES(?,?)")) {
                            ps.setString(1, name);
                            ps.setDouble(2, deposit);
                            ps.executeUpdate();
                            System.out.println("Account created successfully!");
                        }
                        break;

                    case 2:
                        System.out.print("Enter account number: ");
                        int accDep = sc.nextInt();
                        System.out.print("Enter amount to deposit: ");
                        double amtDep = sc.nextDouble();
                        if (amtDep <= 0) { System.out.println("Cannot deposit negative!"); break; }
                        try (PreparedStatement ps = conn.prepareStatement(
                                "UPDATE accounts SET balance = balance + ? WHERE account_number = ?")) {
                            ps.setDouble(1, amtDep);
                            ps.setInt(2, accDep);
                            int rows = ps.executeUpdate();
                            if (rows > 0) System.out.println("Deposit successful!");
                            else System.out.println("Account not found!");
                        }
                        break;

                    case 3:
                        System.out.print("Enter account number: ");
                        int accW = sc.nextInt();
                        System.out.print("Enter amount to withdraw: ");
                        double amtW = sc.nextDouble();
                        if (amtW <= 0) { System.out.println("Cannot withdraw negative!"); break; }

                        try (PreparedStatement ps = conn.prepareStatement(
                                "SELECT balance FROM accounts WHERE account_number = ?")) {
                            ps.setInt(1, accW);
                            ResultSet rs = ps.executeQuery();
                            if (rs.next()) {
                                double bal = rs.getDouble("balance");
                                if (bal < amtW) System.out.println("Insufficient balance!");
                                else {
                                    try (PreparedStatement ps2 = conn.prepareStatement(
                                            "UPDATE accounts SET balance = balance - ? WHERE account_number = ?")) {
                                        ps2.setDouble(1, amtW);
                                        ps2.setInt(2, accW);
                                        ps2.executeUpdate();
                                        System.out.println("Withdrawal successful!");
                                    }
                                }
                            } else System.out.println("Account not found!");
                        }
                        break;

                    case 4:
                        System.out.print("From account number: ");
                        int fromAcc = sc.nextInt();
                        System.out.print("To account number: ");
                        int toAcc = sc.nextInt();
                        System.out.print("Amount to transfer: ");
                        double amtT = sc.nextDouble();
                        if (amtT <= 0) { System.out.println("Cannot transfer negative!"); break; }

                        try (PreparedStatement ps1 = conn.prepareStatement("SELECT balance FROM accounts WHERE account_number = ?")) {
                            ps1.setInt(1, fromAcc);
                            ResultSet rsFrom = ps1.executeQuery();
                            if (!rsFrom.next()) { System.out.println("Sender account not found!"); break; }
                            double balFrom = rsFrom.getDouble("balance");
                            if (balFrom < amtT) { System.out.println("Insufficient balance!"); break; }

                            ps1.setInt(1, toAcc);
                            ResultSet rsTo = ps1.executeQuery();
                            if (!rsTo.next()) { System.out.println("Receiver account not found!"); break; }

                            try (PreparedStatement psWithdraw = conn.prepareStatement(
                                    "UPDATE accounts SET balance = balance - ? WHERE account_number = ?");
                                 PreparedStatement psDeposit = conn.prepareStatement(
                                         "UPDATE accounts SET balance = balance + ? WHERE account_number = ?")) {
                                psWithdraw.setDouble(1, amtT);
                                psWithdraw.setInt(2, fromAcc);
                                psWithdraw.executeUpdate();

                                psDeposit.setDouble(1, amtT);
                                psDeposit.setInt(2, toAcc);
                                psDeposit.executeUpdate();

                                System.out.println("Transfer successful!");
                            }
                        }
                        break;

                    case 5:
                        System.out.print("Enter account number: ");
                        int accB = sc.nextInt();
                        try (PreparedStatement ps = conn.prepareStatement("SELECT balance FROM accounts WHERE account_number = ?")) {
                            ps.setInt(1, accB);
                            ResultSet rs = ps.executeQuery();
                            if (rs.next()) System.out.println("Balance: " + rs.getDouble("balance"));
                            else System.out.println("Account not found!");
                        }
                        break;

                    case 6:
                        exit = true;
                        System.out.println("Exiting...");
                        break;

                    default:
                        System.out.println("Invalid choice!");
                }
            } catch (SQLException | IOException e) {
                e.printStackTrace();
            }
        }

        sc.close();
    }
}
