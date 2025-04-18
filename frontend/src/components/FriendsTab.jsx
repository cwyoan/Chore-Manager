function FriendsTab({ friends }) {
  return (
    <div className="section friends-section">
      <h2>Friends</h2>
      {friends.length > 0 ? (
        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.UserID}>
              {friend.FirstName} {friend.LastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No friends available.</p>
      )}
    </div>
  );
}

export default FriendsTab;
