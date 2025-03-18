import { useParams } from "react-router-dom";

const User = () => {
    let { id } = useParams(); // Get ID from URL

    return (
        <div>
            <h1>User Profile</h1>
            <p>Welcome, User {id}!</p>
        </div>
    );
};

export default User;
