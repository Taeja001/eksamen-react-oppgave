import React, { useState } from "react";
import { Container, Table, Form, Button, Alert } from "react-bootstrap";
 
function AdminPage() {
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [data, setData] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
 
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/support", {
        headers: {
          Authorization: "Basic " + btoa(`${auth.username}:${auth.password}`),
        },
      });
      if (!res.ok) throw new Error("Ugyldig brukernavn eller passord");
      const result = await res.json();
      setData(result);
      setLoggedIn(true);
    } catch (err) {
      setError(err.message);
    }
  };
 
  const toggleResolve = async (id, currentStatus) => {
    await fetch(`http://localhost:5000/api/support/${id}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !currentStatus }),
    });
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_resolved: !currentStatus } : item
      )
    );
  };
 
  const handleTypeChange = (id, type) => {
    setSelectedTypes((prev) => ({ ...prev, [id]: type }));
  };
 
  const handleADCreation = async (item) => {
    const type = selectedTypes[item.id];
    if (!type) return alert("Velg brukertype først");
 
    const username = item.name.toLowerCase().replace(" ", ".");
    const res = await fetch(`http://localhost:5000/api/support/${item.id}/ad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name: item.name, type }),
    });
 
    if (res.ok) {
      alert(`AD-bruker for ${item.name} er opprettet som ${type}`);
    } else {
      const data = await res.json();
      alert(`Feil: ${data.error}`);
    }
  };
 
  if (!loggedIn) {
    return (
      <Container className="mt-4">
        <h2>Admin Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Brukernavn</Form.Label>
            <Form.Control onChange={(e) => setAuth({ ...auth, username: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Passord</Form.Label>
            <Form.Control type="password" onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
          </Form.Group>
          <Button onClick={fetchData}>Logg inn</Button>
        </Form>
      </Container>
    );
  }
 
  return (
    <Container className="mt-4">
      <h2>Supporthenvendelser</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Problemtype</th>
            <th>Beskrivelse</th>
            <th>Dato</th>
            <th>Status</th>
            <th>Handling</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.problem_type}</td>
              <td>{item.description}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>
                {item.is_resolved ? (
                  <span style={{ color: "green" }}>Løst</span>
                ) : (
                  <span style={{ color: "red" }}>Ikke løst</span>
                )}
              </td>
              <td>
                <Button
                  variant={item.is_resolved ? "outline-danger" : "outline-success"}
                  size="sm"
                  className="me-2"
                  onClick={() => toggleResolve(item.id, item.is_resolved)}
                >
                  {item.is_resolved ? "Angre" : "Marker som løst"}
                </Button>
 
                <Form.Select
                  size="sm"
                  className="mb-1 mt-1"
                  value={selectedTypes[item.id] || ""}
                  onChange={(e) => handleTypeChange(item.id, e.target.value)}
                >
                  <option value="">Velg type</option>
                  <option value="Ny ansatt">Ny ansatt</option>
                  <option value="Ekstern">Ekstern</option>
                  <option value="Student">Student</option>
                </Form.Select>
 
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={!selectedTypes[item.id]}
                  onClick={() => handleADCreation(item)}
                >
                  Opprett AD-bruker
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
 
export default AdminPage;
 