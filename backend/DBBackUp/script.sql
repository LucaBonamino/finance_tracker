insert into transaction_categories
(category)
values
('fixed-expenses'),
('variables-expenses');


insert into transaction_types
(type, category_id ) values
('rent', 1),
('parking', 2),
('food', 1),
('PayPall', 1),
('unknown - BELAIR DISTRIB 02.03',null),
('SAINTE IRINE', null),
('Medical', 2),
('Occasional food', 2),
('glosseries', 1),
('tenue-compte', 1),
('Caisse-Medico', 1),
('electricity', 1);


insert into transactions
(date, quantity, transaction_type_id)
values
('2025-03-03', 1550, 1),
('2025-03-03', 90, 2),
('2025-03-03', 10, 2),
('2025-03-03', 40.7, 3),
('2025-03-04', 4.9, 4),
('2025-03-04', 100, 9),
('2025-03-10', 11, 5),
('2025-03-11', 3.6, 8),
('2025-03-17', 100, 3),
('2025-03-17', 70.8, 6),
('2025-03-21', 3.5, 7),
('2025-03-24', 17.5, 8),
('2025-03-25', 341.61, 10),
('2025-03-25', 43.27, 11),
('2025-03-31', 3, 12)







select * from transaction_types tt



select * from transaction_categories tc