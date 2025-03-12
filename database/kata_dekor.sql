-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Már 08. 19:54
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `kata_dekor`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `order`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `rentable_id` int(11) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `order`
--

INSERT INTO `order` (`order_id`, `user_id`, `rentable_id`, `order_date`) VALUES
(1, 1, 1, '2025-03-02 16:03:59');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quote_request`
--

CREATE TABLE `quote_request` (
  `quote_request_id` int(11) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `quote_request`
--

INSERT INTO `quote_request` (`quote_request_id`, `last_name`, `first_name`, `email`, `note`) VALUES
(112, 'King', 'jj', 'katadekor@gmail.com', 'gjcvzu'),
(113, 'King', 'jj', 'katadekor@gmail.com', 'gjcvzu'),
(114, 'Kozma', 'Olivér', 'jf@gmail.com', 'Király weboldal'),
(115, 'Kozma', 'Olivér', 'jf@gmail.com', 'Király weboldal'),
(116, 'Noémi', 'Néző', 'nezonoemi2@gmail.com', 'Kedves Katadekor!\nSzeretnék árajánlatot kérni!\nÜdv: Noémi'),
(117, 'Olivér', 'Kozma', 'kozmao2005@gmail.com', 'fontos'),
(118, 'King', 'jj', 'katadekoreseskuvoszervees@gmail.com', 'asdasdasd'),
(119, 'King', 'jj', 'admin@mcitomi.hu', 'hwzw'),
(120, 'Szoba', 'hello', 'admin@mcitomi.hu', 'hhvg'),
(121, 'xh', 'jj', 'admin@mcitomi.hu', 'k'),
(122, 'xh', 'jj', 'admin@mcitomi.hu', 'sdcfasfv');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `rentable_products`
--

CREATE TABLE `rentable_products` (
  `rentable_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `rentable_products`
--

INSERT INTO `rentable_products` (`rentable_id`, `product_name`, `product_price`) VALUES
(1, 'Makramé hinta', 10000.00),
(2, 'Hengerváza', 500.00),
(3, 'Martinis váza', 1500.00),
(4, 'Martinis váza /kisméretű/', 500.00),
(5, 'Kocka váza', 550.00),
(6, 'Gömb váza /kisméretű/', 250.00),
(7, 'Gömb váza /nagyméretű/', 1400.00),
(8, 'Konyakos váza', 1600.00),
(9, 'Tükörlap köralakú /kisméretű/', 450.00),
(10, 'Türkölap köralakú /közepes méretű/', 650.00),
(11, 'Tükörlap köralakú /nagy méretű/', 900.00),
(12, 'Tükörlap négyzetalakú /kisméretű/', 450.00),
(13, 'Tükörlap négyzetalakú /nagy méretű/', 850.00),
(14, 'Sziromszóró állvány papírtölcsérekkel', 2700.00),
(15, 'Macaron fal', 1500.00),
(16, 'Szívalakú fa bonbon tartó', 1200.00),
(17, 'Fa fánkfal', 1000.00),
(18, 'Csipeszes fa ültetőtábla', 1000.00),
(19, 'Talpas mécsestartó /repesztett/', 1400.00),
(20, 'Fehér lámások', 1000.00),
(21, 'Fehér leszúrható kampók', 1000.00),
(22, 'Üveg mécsestartó /kisméret/', 200.00),
(23, 'Arany virágállvány', 2600.00),
(24, 'Plexi üdvözlő arany felirattal', 6500.00),
(25, 'Ültetési tábla arany felirattal', 5000.00);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` int(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`user_id`, `last_name`, `first_name`, `email`, `phone_number`, `password`) VALUES
(1, 'Kiss', 'Péter', 'peter.kiss@example.com', 123456789, 'hashed_password1'),
(2, 'Nagy', 'Anna', 'anna.nagy@example.com', 987654321, 'hashed_password2'),
(4, 'Kozma', 'Olivér', 'admin@gmail.com', 2147483647, 'jbewkb161'),
(5, 'Elek', 'Teszt', 'marcitom33@gmail.com', 2147483647, '$2a$14$KqeKhlY1ZkyoAKhI1tFbzuf52b3cgxQizFxvuMkpxMUnxq0T9uW0W');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `rentable_id` (`rentable_id`);

--
-- A tábla indexei `quote_request`
--
ALTER TABLE `quote_request`
  ADD PRIMARY KEY (`quote_request_id`);

--
-- A tábla indexei `rentable_products`
--
ALTER TABLE `rentable_products`
  ADD PRIMARY KEY (`rentable_id`);

--
-- A tábla indexei `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `order`
--
ALTER TABLE `order`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT a táblához `quote_request`
--
ALTER TABLE `quote_request`
  MODIFY `quote_request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT a táblához `rentable_products`
--
ALTER TABLE `rentable_products`
  MODIFY `rentable_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_ibfk_2` FOREIGN KEY (`rentable_id`) REFERENCES `rentable_products` (`rentable_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
