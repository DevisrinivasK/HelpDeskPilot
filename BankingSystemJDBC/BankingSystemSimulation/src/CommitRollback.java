import java.io.FileInputStream;
import java.sql.*;
import java.util.*;
public class CommitRollback {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        Properties props = new Properties();
        try (FileInputStream file = new FileInputStream("resources/db.properties")) {
            props.load(file);
        }
        Connection conn = DriverManager.getConnection(
                props.getProperty("url"),
                props.getProperty("username"),
                props.getProperty("password")
        );
        conn.setAutoCommit(false);
        String query1="UPDATE accounts SET balance=balance-? WHERE account_number=?";
        String query2="UPDATE accounts SET balance=balance+? WHERE account_number=?";
        try{
            System.out.println(" Transfer Amount between Accounts");
            PreparedStatement ps1= conn.prepareStatement(query1);
            PreparedStatement ps2= conn.prepareStatement(query2);
            System.out.println("Enter the from account number: ");
            int fromAc=scanner.nextInt();
            System.out.println("Enter the to account number: ");
            int toAc=scanner.nextInt();
            System.out.println("Enter amount you want to transfer: ");
            int amount=scanner.nextInt();
            ps1.setInt(1,amount);
            ps1.setInt(2,fromAc);
            ps2.setInt(1,amount);
            ps2.setInt(2,toAc);
            ps1.executeUpdate();
            ps2.executeUpdate();
            conn.commit();
            System.out.println("Money transferred succesffully ");
            ps1.close();
            ps2.close();

        }catch(Exception e){
            conn.rollback();
            System.out.println(e.getMessage());
        }finally{
            conn.close();
        }


    }
}

