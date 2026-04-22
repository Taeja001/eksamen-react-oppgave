import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
 
function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    problem_type: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitted(true);
    setForm({ name: "", email: "", problem_type: "", description: "" });
  };
 
  return (
    <Container className="mt-4">
      <h2>IT Support Henvendelse</h2>
      {submitted && <Alert variant="success">Takk for henvendelsen!</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Navn</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>E-post</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Problemtype</Form.Label>
          <Form.Control name="problem_type" value={form.problem_type} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Problembeskrivelse</Form.Label>
          <Form.Control as="textarea" name="description" rows={4} value={form.description} onChange={handleChange} required />
        </Form.Group>
        <Button type="submit">Send henvendelse</Button>
      </Form>
    </Container>
  );
}
 
export default SupportPage;
 
 